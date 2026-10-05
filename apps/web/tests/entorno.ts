// Base de datos exclusiva para tests: se borra y se recrea en cada corrida.
export const BASE_DE_TEST = 'uap_web_test'
export const URL_SERVIDOR_PG = process.env.TEST_PG_URL || 'postgresql://payload:payload@127.0.0.1:54329/postgres'
export const URL_BASE_DE_TEST = URL_SERVIDOR_PG.replace(/\/[^/]*$/, `/${BASE_DE_TEST}`)
