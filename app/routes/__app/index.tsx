import { Transition } from "@headlessui/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// export const loader = async ({ request }: LoaderArgs) => {
//   const url = new URL(request.url);
//   const success = url.searchParams.get("success");

//   return json({});
// };

export default function Index() {
  // const data = useLoaderData<typeof loader>();
  return (
    <div>
      <Transition
        appear
        show
        enter="transition-all duration-1000"
        enterFrom="translate-y-8 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition-all duration-150"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-6 opacity-0"
      >
        <img
          src="/hero-images/flight-noon.png"
          alt="A cozycraft-ian in flight in the midst of the afternoon"
          className="w-full h-auto object-cover rounded-3xl shadow-md shadow-black/25"
        />
      </Transition>
    </div>
  );
}
