import { Injectable } from '@angular/core';
import { ListResult, Storage, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

	constructor(private storage: Storage) { }

  async subirArchivo(archivo: File, ruta: string): Promise<string> {
		const refArchivo = ref(this.storage, ruta);

		try {
      await uploadBytes(refArchivo, archivo);

			return await getDownloadURL(refArchivo);
		} catch (error) {
			throw Error('Hubo un problema al subir el archivo.');
		}
	}

  async linkDeDescarga(ruta: string): Promise<string> {
    const refArchivo = ref(this.storage, ruta);
    return await getDownloadURL(refArchivo);
  }

  async traerTodosLosArchivos(ruta: string): Promise<ListResult> {
    const refLista = ref(this.storage, ruta);
    return await listAll(refLista)
  }
}
