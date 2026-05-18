import { env, isLocalStorageAllowed, isR2Configured } from "@/lib/env";
import { LocalStorageService } from "@/lib/storage/local";
import { R2StorageService } from "@/lib/storage/r2";

export function getStorageService() {
  if (env.STORAGE_DRIVER === "r2") {
    if (!isR2Configured()) {
      throw new Error("R2 storage seçildi ancak gerekli ortam değişkenleri eksik.");
    }

    return new R2StorageService();
  }

  if (!isLocalStorageAllowed()) {
    throw new Error(
      "Production ortamında local storage kullanılamaz. STORAGE_DRIVER=r2 yapılandırın.",
    );
  }

  return new LocalStorageService();
}
