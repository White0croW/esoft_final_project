import { ZodError, AnyZodObject } from "zod";
import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { Role } from '@prisma/client';

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

// Валидация для создания/обновления пользователя
export const validateUser = [
    body('name').trim().notEmpty().withMessage('Имя обязательно'),
    body('email').trim().isEmail().withMessage('Некорректный email'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Пароль должен быть минимум 6 символов'),
    body('role').isIn(Object.values(Role)).withMessage('Некорректная роль'),
    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Некорректный номер телефона')
];

export const validateBarbershop = [
    body('name').trim().notEmpty().withMessage('Название обязательно'),
    body('address').trim().notEmpty().withMessage('Адрес обязателен'),
    body('lat').isNumeric().withMessage('Широта должна быть числом'),
    body('lon').isNumeric().withMessage('Долгота должна быть числом'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
