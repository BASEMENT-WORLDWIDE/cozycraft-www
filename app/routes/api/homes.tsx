import type { Server } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { zfd } from "zod-form-data";
import { requireApiKey } from "~/api.server";
import { db } from "~/db.server";
import { z } from "zod";

export const loader = async ({ request }: LoaderArgs) => {
  try {
    requireApiKey(request);
    const searchParams = new URL(request.url).searchParams;
    const playerId = searchParams.get("playerId");
    const server = (searchParams.get("server") as Server | null) ?? "survival";
    const worldName = searchParams.get("world") ?? undefined;
    if (typeof playerId !== "string") {
      throw "User not found.";
    }
    const accountHomes = await db.minecraftAccountHome.findMany({
      where: {
        minecraftAccountMojangUUID: playerId,
        worldName,
        server,
      },
      select: {
        id: true,
        name: true,
        x: true,
        y: true,
        z: true,
        worldName: true,
      },
    });
    const homes = accountHomes.reduce<
      Record<string, typeof accountHomes[number]>
    >((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});
    return json({ homes });
  } catch (err) {
    if (typeof err === "string") {
      return json({ error: err }, { status: 400 });
    }
    console.error(err);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};

const createHomeSchema = zfd.formData({
  id: zfd.text(),
  name: zfd.text(),
  x: zfd.numeric(),
  z: zfd.numeric(),
  y: zfd.numeric(),
  playerId: zfd.text(),
  worldName: zfd.text(),
  server: zfd
    .text(z.enum(["survival", "creative"] as const))
    .default("survival"),
});

const deleteHomeSchema = zfd.formData({
  id: zfd.text(),
});

export const action = async ({ request }: ActionArgs) => {
  try {
    requireApiKey(request);
    const formData = await request.formData();
    if (request.method === "POST") {
      const data = createHomeSchema.parse(formData);
      const createdHome = await db.minecraftAccountHome.create({
        data: {
          id: data.id,
          name: data.name,
          x: data.x,
          y: data.y,
          z: data.z,
          worldName: data.worldName,
          server: data.server,
          minecraftAccount: {
            connect: {
              mojangUUID: data.playerId,
            },
          },
        },
      });
      return json({ home: createdHome });
    }
    if (request.method === "PUT") {
      const data = createHomeSchema.parse(formData);
      const updatedHome = await db.minecraftAccountHome.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          x: data.x,
          y: data.y,
          z: data.z,
          server: data.server,
          worldName: data.worldName,
          minecraftAccount: {
            connect: {
              mojangUUID: data.playerId,
            },
          },
        },
      });
      return json({ home: updatedHome });
    }
    if (request.method === "DELETE") {
      const data = deleteHomeSchema.parse(formData);
      const deletedHome = await db.minecraftAccountHome.delete({
        where: { id: data.id },
      });
      return json({ home: deletedHome });
    }
    return json({ error: "Not Allowed" }, 405);
  } catch (err) {
    if (typeof err === "string") {
      return json({ error: err }, { status: 400 });
    }
    console.error(err);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
