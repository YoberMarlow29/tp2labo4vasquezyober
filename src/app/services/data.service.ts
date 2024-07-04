import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, query, QuerySnapshot, orderBy, Query, limit, DocumentSnapshot, getDoc, FieldPath, where } from '@angular/fire/firestore';
import { Usuario } from '../models/Usuario';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  /**
   * Trae un Array de objetos guardados en la colección especificada de `Firestore`.
   *
   * @async
   * @param coleccion - El nombre de la colección en `Firestore`.
   * @param ordenarPorCampo - El campo (propiedad del objeto) por el cual ordenar el array.
   * @returns Una promesa con los datos pedidos.
   *
   * Nota: Asegurarse que el campo existe en el objeto y en todas sus instancias de la colección,
   *  si no existe, el doc se omitirá del array final.
   */
  async traerColeccion<T>(coleccion: string, ordenarPorCampo?: string): Promise<Array<T>> {
    const col = collection(this.firestore, coleccion);

    let q: Query;
    if (ordenarPorCampo)
      q = query(col, orderBy(ordenarPorCampo));
    else
      q = query(col)

    const querySnapshot = await getDocs(q);
    const arrAux: Array<T> = [];

    querySnapshot.forEach((doc) => {
      arrAux.push(doc.data() as T);
    });

    return arrAux;
  }
  /**
   * Trae un único objeto guardado en el documento especificado de la colección de `Firestore`.
   *
   * @async
   * @param coleccion - El nombre de la colección en `Firestore`.
   * @param docId - El ID del documento a traer en la colección en `Firestore`.
   * @returns Una promesa con el dato pedido.
   */
  async traerDoc<T>(coleccion: string, docId: string): Promise<T | null> {
    try {
      // console.log(`Buscando documento en la colección ${coleccion} con ID ${docId}`);
      const docRef = doc(this.firestore, coleccion, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // console.log("Documento encontrado:", docSnap.data());
        const data = docSnap.data();
        return data as T;
      } else {
        // console.error(`No se encontró el documento en la colección ${coleccion} con ID ${docId}`);
        return null;
      }
    } catch (error) {
      // console.error("Error obteniendo el documento:", error);
      throw error;
    }
  }

  async subirDocNoUsuarios(coleccion: string, data: any, docIdAutom: boolean = true): Promise<string> {
    const col = collection(this.firestore, coleccion);
    const nuevoDoc = doc(col);
    if (docIdAutom)
      data.id = nuevoDoc.id;

    try {
      await setDoc(nuevoDoc, { ...data });
    } catch (error) {
      deleteDoc(nuevoDoc);
      console.log(error);
    }

    return nuevoDoc.id;
  }
  async verificarDisponibilidadTurno(coleccion: string, fecha: string, desde: string, hasta: string): Promise<boolean> {
    const col = collection(this.firestore, coleccion);
    const q = query(col,
      where('horarioFechaTurno.fecha', '==', fecha),
      where('horarioFechaTurno.desde', '==', desde),
      where('horarioFechaTurno.hasta', '==', hasta),
      where('estadoTurno', 'in', ['pendiente', 'aceptado']));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  }

    /**
   * Sube un objeto a la colección de `Firestore` y asigna el UID del usuario como ID del documento.
   *
   * @async
   * @param coleccion - El nombre de la colección en `Firestore`.
   * @param data - El objeto o dato a subir.
   * @param docId - El ID del documento (UID del usuario).
   * @returns El ID del documento en `Firestore`.
   *
   * @throws y elimina el documento si se encuentra con algún error a la hora de subir.
   */
    async subirDoc(coleccion: string, data: any, docId?: string): Promise<string> {

      const col = collection(this.firestore, coleccion);
      const nuevoDoc = doc(col, docId);

      try {

        await setDoc(nuevoDoc, { ...data });

      } catch (error) {
        await deleteDoc(nuevoDoc);
        throw error;
      }

      return nuevoDoc.id;

    }

  /**
   * Actualiza un doc en la colección de `Firestore`.
   *
   * @param coleccion - El nombre de la colección en `Firestore`.
   * @param docId - El ID del documento a traer en la colección en `Firestore`.
   * @param data - Los datos a actualizar (puede ser un campo solo).
   * @returns Una promesa que se resuelve cuando el dato es actualizado correctamente.
   */
  actualizarDoc(coleccion: string, docId: string, data: any) {
    const docRef = doc(this.firestore, coleccion, docId);

    return updateDoc(docRef, { ...data });
  }

  /**
   * Escucha los cambios en una colección en `Firestore` y guarda los datos en un Array que
   *  recibe por parámetro y que funcionará como puntero para mantenerse actualizado.
   *
   * @param coleccion - El nombre de la colección en `Firestore`.
   * @param arrayPointer - El Array que guardará los objetos.
   * @param filtroFunc - Función que se encarga de filtrar los datos cada vez que se actualizan.
   * @param ordenFunc - Función que se encarga de ordenar los datos cada vez que se actualizan.
   * @param transformar - Función que se encarga de transformar los datos cada vez que se actualizan.
   *
   * Nota: El tipo de dato u objeto debe tener un campo `id: string`.
   */
  escucharColeccion<T extends { id: string }>(
    coleccion: string,
    arrayPointer: Array<T>,
    filtroFunc?: (item: T) => boolean,
    ordenFunc?: (a: any, b: any) => number,
    transformar?: (item: T) => Promise<T>
  ) {
    const col = collection(this.firestore, coleccion);
    const q = query(col);

    onSnapshot(q, async (addSnap: QuerySnapshot) => {
      for (const cambio of addSnap.docChanges()) {
        const data = cambio.doc.data();
        const newData = transformar ? await transformar(data as T) : data as T;
        if (!filtroFunc || filtroFunc(newData)) {
          if (cambio.type === 'added') {
            arrayPointer.push(newData);
          } else {
            const index = arrayPointer.findIndex(t => t.id === newData.id);
            if (cambio.type === 'modified')
              arrayPointer[index] = newData;
            else
              arrayPointer.splice(index, 1);
          }
        }
      }

      if (ordenFunc)
        arrayPointer.sort(ordenFunc);
    });
  }
  /**
   * Elimina un documento específico de la colección especificada en Firestore.
   *
   * @async
   * @param coleccion - El nombre de la colección en Firestore.
   * @param docId - El ID del documento a eliminar.
   * @returns Una promesa que se resuelve cuando se elimina correctamente el documento.
   */
  async borrarDoc(coleccion: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, coleccion, docId);
    await deleteDoc(docRef);
  }
  /**
   * Busca el usuario que tenga registrado su correo con el parámetro de búsqueda.
   * Por predeterminado busca en la colección `users`.
   *
   * @async
   * @param correo - Correo a buscar.
   * @returns Si lo encuentra, el usuario con el correo indicado.
   *
   */
  async buscarUsuarioPorCorreo(correo: string): Promise<Usuario> {
    const usuarios = await this.traerColeccion<Usuario>("user");
    const index = usuarios.findIndex(u => u.email === correo);
    return usuarios[index];
  }

  /**
   * Busca el usuario que tenga registrado su DNI con el parámetro de búsqueda.
   * Por predeterminado busca en la colección `users`.
   *
   * @async
   * @param dni - DNI a buscar.
   * @returns Si lo encuentra, el usuario con el DNI indicado.
   *
   */
  async buscarUsuarioPorDni(dni: number): Promise<Usuario> {
    const usuarios = await this.traerColeccion<Usuario>("user");
    const index = usuarios.findIndex(u => u.dni === dni);

    return usuarios[index];
  }
}
