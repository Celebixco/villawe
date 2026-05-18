import {
  env,
  getStorageConfigurationError,
  isLocalStorageConfigured,
  isR2Configured,
} from "@/lib/env";
import { LocalStorageService } from "@/lib/storage/local";
import { R2StorageService } from "@/lib/storage/r2";

export function getStorageService() {
  if (env.STORAGE_DRIVER === "r2") {
    if (!isR2Configured()) {
      throw new Error(
        getStorageConfigurationError() ||
          "R2 storage seçildi ancak gerekli ortam değişkenleri eksik.",
      );
    }

    return new R2StorageService();
  }

  if (!isLocalStorageConfigured()) {
    throw new Error(
      getStorageConfigurationError() ||
        "Local storage yalnızca development ortamında açık ve yapılandırılmış olabilir.",
    );
  }

  return new LocalStorageService();
}
