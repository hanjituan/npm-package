import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VueSetupExtend()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	build: {
		outDir: 'drah-chart',
		lib: {
			entry: path.resolve(__dirname, 'src/components/index.js'),
			name: 'DragChart',
			fileName: (format) => `drag-chart.${format}.js`
		},
		rollupOptions: {
			external: ['vue', 'dayjs', 'echarts'],
			output: {
				globals: {
					vue: 'Vue',
					dayjs: 'dayjs',
					echarts: 'echarts'
				}
			}
		}
	}
})
