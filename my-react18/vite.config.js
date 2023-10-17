/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-04 16:55:18
 * @Description: 
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            react: path.resolve(__dirname, 'src/react'),
            'react-dom': path.resolve(__dirname, 'src/react-dom'),
            'react-reconciler': path.resolve(__dirname, 'src/react-reconciler'),
            Scheduler: path.resolve(__dirname, 'src/Scheduler'),
            shared: path.resolve(__dirname, 'src/shared'),
        }
    },
    plugins: [
        react()
    ]
})