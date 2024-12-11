import z from 'zod';

export const SignUpSchema = z.object({
    "email": z.string().email(),
    "password": z.string().min(6, 'Password should be greater than 6 characters'),
    "username": z.string().min(3, 'username should be greater than 3 characters')
})