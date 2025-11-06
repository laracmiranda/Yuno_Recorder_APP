import { flipFuses, FuseVersion, FuseV1Options } from "@electron/fuses";
import path from "path";
import fs from "fs";

export default async function applyFuses(context) {
  const dir = context.appOutDir;

  // Procura binário principal
  const exeFile = fs.readdirSync(dir).find((f) =>
    f.endsWith(".exe") || f === "electron" || f === context.packager.appInfo.productFilename
  );

  if (!exeFile) {
    console.error("Nenhum executável encontrado em:", dir);
    return;
  }

  const exePath = path.join(dir, exeFile);
  console.log("Aplicando fuses em:", exePath);

  await flipFuses(exePath, {
    version: FuseVersion.V1,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
  });

  console.log("Fuses aplicados com sucesso!");
}
