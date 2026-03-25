import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);
    private bucket: any;

    constructor() {
        // Inicializar Firebase Admin si no ha sido inicializado antes
        if (!admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    }),
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                });
                this.logger.log('🔥 Firebase Admin inicializado exitosamente');
            } catch (error: any) {
                this.logger.error(`❌ Error inicializando Firebase Admin: ${error.message}`);
            }
        }
        this.bucket = admin.storage().bucket();
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<{ url: string }> {
        if (!file) {
            throw new InternalServerErrorException('No se ha proporcionado ningún archivo para subir.');
        }

        try {
            const fileName = `${folder}/${uuidv4()}_${file.originalname.replace(/\s+/g, '_')}`;
            const fileRef = this.bucket.file(fileName);

            const stream = fileRef.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
                public: true, // Hacerlo público para obtener el link directo
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (error: any) => {
                    this.logger.error(`❌ Error subiendo a Firebase: ${error.message}`);
                    reject(new InternalServerErrorException('Error al subir el archivo a Firebase Storage.'));
                });

                stream.on('finish', () => {
                    // El formato de URL pública de Firebase Storage es:
                    // https://storage.googleapis.com/{bucket_name}/{file_path}
                    const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
                    this.logger.log(`✅ Archivo subido con éxito: ${publicUrl}`);
                    resolve({ url: publicUrl });
                });

                stream.end(file.buffer);
            });
        } catch (error: any) {
            this.logger.error(`❌ Error fatal en uploadFile de Firebase: ${error.message}`);
            throw new InternalServerErrorException('Fallo en el servicio de almacenamiento de archivos.');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extraer el path del archivo desde la URL de Google Storage
            // La URL suele ser https://storage.googleapis.com/tu-bucket/folder/archivo.ext
            const bucketPart = `https://storage.googleapis.com/${this.bucket.name}/`;
            if (!fileUrl.includes(bucketPart)) {
                this.logger.warn(`⚠️ URL de archivo no válida para borrar o no es de Firebase: ${fileUrl}`);
                return;
            }

            const fileName = fileUrl.replace(bucketPart, '');
            const fileRef = this.bucket.file(fileName);

            const [exists] = await fileRef.exists();
            if (exists) {
                await fileRef.delete();
                this.logger.log(`🗑️ Archivo borrado de Firebase: ${fileName}`);
            }
        } catch (error: any) {
            this.logger.error(`❌ Error borrando archivo de Firebase: ${error.message}`);
        }
    }
}
