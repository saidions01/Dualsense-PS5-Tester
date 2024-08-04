import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'modules',
    minify: false,  // Disable minification
    lib: {
      entry: './src/index.ts',
      name: "DualSense",
      fileName: (format) => {
        return `${format}/dualsense.js`
      },
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          // Define global variable names for UMD builds here if necessary
        },
        // Ensure the output file is not minified or obfuscated
        sourcemap: true,
        exports: 'named'
      }
    }
  }
})
