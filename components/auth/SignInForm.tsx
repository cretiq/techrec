// File: components/auth/SignInForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { Button } from '@/components/ui-daisy/button';
import { Input } from '@/components/ui-daisy/input';
import { toast } from 'sonner';

const SignInFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignInFormInputs = z.infer<typeof SignInFormSchema>;

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>({
    resolver: zodResolver(SignInFormSchema),
  });

  const onSubmit: SubmitHandler<SignInFormInputs> = async (data) => {
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error('Login Failed: Invalid credentials.');
    } else if (result?.ok) {
      toast.success('Login Successful!');
      router.push('/developer/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <Input
          type="email"
          placeholder="user@example.com"
          className={errors.email ? 'input-error' : ''}
          {...register('email')}
        />
        {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <Input
          type="password"
          placeholder="********"
          className={errors.password ? 'input-error' : ''}
          {...register('password')}
        />
        {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
      </div>
      <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
        Sign In with Email
      </Button>
    </form>
  );
}