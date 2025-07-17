import { ZodError, AnyZodObject } from "zod";
import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { Role } from '@prisma/client';

// Расширяем интерфейс Request для добавления новых свойств
declare module 'express' {
    interface Request {
        validatedData?: {
            body?: any;
            params?: any;
            query?: any;
        };
    }
}

export function validate<T extends AnyZodObject>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        const toValidate = {
            body: req.body,
            params: req.params,
            query: req.query,
        };

        const result = schema.safeParse(toValidate);

        if (!result.success) {
            const zodError = result.error as ZodError;
            return res.status(400).json({ errors: zodError.errors });
        }

        // Создаем новое свойство вместо перезаписи существующих
        req.validatedData = result.data;

        return next();
    };
}

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
        .withMessage('Некорректный номер телефона'),

    // Обработчик ошибок должен быть последним в цепочке
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
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