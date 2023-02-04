export const toMojangUUID = (uuid: string) => {
  let expr =
    /([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]+)/gi;
  return uuid.replace(expr, "$1-$2-$3-$4-$5");
};
