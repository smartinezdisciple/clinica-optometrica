import 'dotenv/config';
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    FRONTEND_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_POOL_MIN: number;
    DB_POOL_MAX: number;
    DB_SSL: boolean;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES: string;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
    SMTP_FROM?: string | undefined;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map