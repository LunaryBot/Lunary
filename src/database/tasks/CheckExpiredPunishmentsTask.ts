import { sql } from '@/utils'

export const createCheckExpiredPunishmentsTask = async() => {
	await sql`
        CREATE OR REPLACE FUNCTION check_expired_punishments()
        RETURNS void AS $$
        BEGIN
        PERFORM pg_notify('punishment_expired', row_to_json(t)::text)
        FROM "Punishment" t
        WHERE t.expires_at <= NOW() AND t.closed IS FALSE;

        UPDATE "Punishment"
        SET closed = TRUE
        WHERE expires_at <= NOW() AND closed IS FALSE;
        END;
        $$ LANGUAGE plpgsql;
    `

	await sql`
        SELECT cron.schedule('check_expired_punishments', '5 seconds', 'SELECT check_expired_punishments();');
    `
}