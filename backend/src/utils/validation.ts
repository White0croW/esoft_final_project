import { ZodError, AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware для валидации запросов по заданной Zod-схеме.
 * Схема должна описывать объект вида { body, params, query }.
 * После успешной валидации переписывает req.body, req.params и req.query
 * на приведённые (и преобразованные) значения.
 */
export function validate<T extends AnyZodObject>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        // собираем данные для валидации
        const toValidate = {
            body: req.body,
            params: req.params,
            query: req.query,
        };

        // выполняем безопасный парсинг (safeParse возвращает { success, data, error })
        const result = schema.safeParse(toValidate);

        if (!result.success) {
            // ZodError — структурированный список ошибок
            const zodError = result.error as ZodError;
            return res.status(400).json({ errors: zodError.errors });
        }

        // если всё ок, берём преобразованные данные (например, .transform() или .preprocess())
        const { body, params, query } = result.data;

        // подменяем старые объекты в req на валидированные и преобразованные
        req.body = body;
        req.params = params;
        req.query = query;

        return next();
    };
}
