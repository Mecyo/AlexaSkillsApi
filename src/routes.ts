import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from 'zod';
import moment from 'moment';

export async function appRoutes(app: FastifyInstance) {

    app.get('/health-check', async () => {
        const databaseDate = await prisma.punishment.count();
        return 'SERVER RUNNING!'
    });
    
    app.get('/punishments', async () => {
        const habits = await prisma.punishment.findMany();

        return habits;
    });

    app.get('/findIdCastigadoActiveByName', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string()
        });
        
        const { nomeCastigado } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
                active: true
            },
            select: {
                id: true,
            },
        });

        const idCastigado = castigado ? castigado.id : undefined;
        
        return idCastigado;
    });

    app.patch('/incrementCastigoById', async (request) => {
        const getPunishmentParams = z.object({
            idCastigado: z.coerce.number(),
            diasCastigo: z.coerce.number(),
        });
        
        const { idCastigado, diasCastigo } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.update({
            where: {
                id: idCastigado,
            },
            data: {
                qtt_days: {
                    increment: diasCastigo
                },
            },
        });

        return castigado.qtt_days;
    });

    app.patch('/updateCastigo', async (request) => {
        const getPunishmentBody = z.object({
            id: z.number(),
            created_at: z.coerce.date().optional(),
            punished_name: z.string().optional(),
            qtt_days: z.number().optional(),
            active: z.boolean().optional()
        });

        const punished = getPunishmentBody.parse(request.body);

        const castigado = await prisma.punishment.update({
            where: {
                id: punished.id,
            },
            data: punished,
        });

        return castigado.qtt_days;
    });

    app.post('/insertCastigo', async (request) => {
        const getPunishmentBody = z.object({
            createdAt: z.coerce.date().optional().default(new Date()),
            punishedName: z.string(),
            qttDays: z.number(),
            active: z.boolean().optional().default(true)
        });

        const punished = getPunishmentBody.parse(request.body);

        const castigado = await prisma.punishment.create({
            data: {
                created_at: punished.createdAt,
                punished_name: punished.punishedName,
                qtt_days: punished.qttDays,
                active: punished.active,
            }
        });

        return castigado;
    });

    app.get('/getValidadeCastigo', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string()
        });
        
        const { nomeCastigado } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
                active: true
            },
            select: {
                created_at: true,
                qtt_days: true
            },
        });

        if(castigado) {
            const startDate = castigado.created_at;
            startDate.setDate(startDate.getDate() + castigado.qtt_days);

            const validadeCastigo = moment(startDate.toISOString().split("T")[0]).format('DD/MM/YYYY');
            
            return validadeCastigo;
        }

        return;
    });
    
    
    /*
    
    async function getValidadeCastigo(nomeCastigado) {
        const client = await connect();
        const res = await client.query(`SELECT (created_at + qtt_days) as validade
            FROM public.punishments
            WHERE punished_name = '${nomeCastigado}'
            AND active is true`);
        console.log("RES: " + JSON.stringify(res));
        console.log("ROWS: " + JSON.stringify(res.rows));
        console.log("ROW[0]: " + JSON.stringify(res.rows[0]));
        console.log("ROW[0]: " + res.rows[0].validade);
        return res.rows[0].validade;
    }*/

    /*app.post('/punishments', async (request) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6))
        });

        const {title, weekDays} = createHabitBody.parse(request.body);

        const today = dayjs().startOf('day').toDate();

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay,
                        }
                    })
                }
            }
        });
    });*/


    // app.get('/day', async (request) => {
    //     const getDayParams = z.object({
    //         date: z.coerce.date()
    //     });

    //     const { date } = getDayParams.parse(request.query);


    //     const parsedDate = dayjs(date).startOf('day');

    //     const weekDay = parsedDate.get('day');

    //     //retornar todos os hábitos possíveis + os que já foram completados
    //     const possibleHabits = await prisma.habit.findMany({
    //         where: {
    //             created_at: {
    //                 lte: date,
    //             },
    //             weekDays: {
    //                 some: {
    //                     week_day: weekDay,
    //                 }
    //             }
    //         }
    //     });

    //     const day = await prisma.day.findUnique({
    //         where: {
    //             date: parsedDate.toDate(),
    //         },
    //         include: {
    //             dayHabits: true,
    //         }
    //     });

    //     const completedHabits = day?.dayHabits.map(dayHabit => {
    //         return dayHabit.habit_id;
    //     }) ?? [];

    //     return {
    //         possibleHabits,
    //         completedHabits
    //     }
    // });

}