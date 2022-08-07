export declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_DB_URI: string;
        }
    }
}
