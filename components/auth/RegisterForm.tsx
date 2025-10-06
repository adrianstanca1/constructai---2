import React, { useState } from 'react';
import { User } from '../../types.ts';
import * as api from '../../api.ts';
import { ArrowPathIcon } from '../Icons.tsx';

interface RegisterFormProps {
    onLoginSuccess: (user: User) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onLoginSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const newUser = await api.registerUser({ name, email, companyName });
            if (newUser) {
                onLoginSuccess(newUser);
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input id="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
                <label htmlFor="reg-password"className="block text-sm font-medium text-gray-700">Password</label>
                <input id="reg-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;