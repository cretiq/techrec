// File: components/auth/SignUpForm.tsx

'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { Button } from '@/components/ui-daisy/button';
import { Input } from '@/components/ui-daisy/input';
import { toast } from 'sonner';

type SignUpFormInputs = z.infer<typeof SignUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong.');
      }

      toast.success('Registration successful! Please sign in.');
      reset();
      router.push('/auth/signin');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
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
          placeholder="At least 8 characters"
          className={errors.password ? 'input-error' : ''}
          {...register('password')}
        />
        {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
      </div>
      <Button type="submit" className="w-full" loading={isLoading}>
        Create Account
      </Button>
    </form>
  );
}