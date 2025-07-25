#!/usr/bin/env tsx

/**
 * Performance Benchmark Suite for HouseHelp Application
 * Measures: Build time, startup time, page load times, API response times, and more
 */

import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

interface PerformanceMetric {
  name: string;
  duration: number;
  status: 'success' | 'failed';
  details?: any;
}

interface BenchmarkResult {
  category: string;
  metrics: PerformanceMetric[];
  totalTime: number;
  averageTime: number;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async runAllBenchmarks(): Promise<void> {
    console.log('🚀 Starting HouseHelp Performance Benchmarks');
    console.log('=' .repeat(60));

    const startTime = performance.now();

    // Run all benchmark categories
    await this.benchmarkBuildPerformance();
    await this.benchmarkStartupPerformance();
    await this.benchmarkFileSystemOperations();
    await this.benchmarkValidationPerformance();
    await this.benchmarkMemoryUsage();
    await this.benchmarkConcurrency();

    const totalTime = performance.now() - startTime;
    this.printSummary(totalTime);
  }

  // 1. Build Performance
  async benchmarkBuildPerformance(): Promise<void> {
    console.log('\n🔨 Benchmarking Build Performance...');
    const metrics: PerformanceMetric[] = [];

    // TypeScript compilation
    await this.measureOperation('TypeScript Compilation', async () => {
      return new Promise<void>((resolve, reject) => {
        const childProcess = spawn('npx', ['tsc', '--noEmit'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        childProcess.on('close', (code: number | null) => {
          if (code === 0) resolve();
          else reject(new Error(`TypeScript compilation failed with code ${code}`));
        });
      });
    }, metrics);

    // ESLint check
    await this.measureOperation('ESLint Check', async () => {
      return new Promise<void>((resolve, reject) => {
        const childProcess = spawn('npm', ['run', 'lint'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        childProcess.on('close', (code: number | null) => {
          if (code === 0) resolve();
          else reject(new Error(`ESLint failed with code ${code}`));
        });
      });
    }, metrics);

    // Production build (clean build)
    await this.measureOperation('Production Build (Clean)', async () => {
      // Clean .next directory first
      try {
        await fs.rm('.next', { recursive: true, force: true });
      } catch (error) {
        // Directory might not exist
      }

      return new Promise<void>((resolve, reject) => {
        const childProcess = spawn('npm', ['run', 'build'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        childProcess.on('close', (code: number | null) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });
      });
    }, metrics);

    this.results.push({
      category: 'Build Performance',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // 2. Startup Performance
  async benchmarkStartupPerformance(): Promise<void> {
    console.log('\n⚡ Benchmarking Startup Performance...');
    const metrics: PerformanceMetric[] = [];

    // Development server startup
    await this.measureOperation('Dev Server Startup', async () => {
      return new Promise<void>((resolve, reject) => {
        const devProcess = spawn('npm', ['run', 'dev'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            devProcess.kill();
            reject(new Error('Dev server startup timeout'));
          }
        }, 30000); // 30 second timeout

        devProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              devProcess.kill();
              resolve();
            }
          }
        });

        devProcess.on('error', (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(error);
          }
        });
      });
    }, metrics);

    // Production server startup
    await this.measureOperation('Production Server Startup', async () => {
      return new Promise<void>((resolve, reject) => {
        const prodProcess = spawn('npm', ['start'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            prodProcess.kill();
            reject(new Error('Production server startup timeout'));
          }
        }, 15000); // 15 second timeout

        prodProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              prodProcess.kill();
              resolve();
            }
          }
        });

        prodProcess.on('error', (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(error);
          }
        });
      });
    }, metrics);

    this.results.push({
      category: 'Startup Performance',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // 3. File System Operations
  async benchmarkFileSystemOperations(): Promise<void> {
    console.log('\n📁 Benchmarking File System Operations...');
    const metrics: PerformanceMetric[] = [];

    // Read package.json
    await this.measureOperation('Read package.json', async () => {
      await fs.readFile('package.json', 'utf8');
    }, metrics);

    // Read multiple component files
    await this.measureOperation('Read Component Files', async () => {
      const componentFiles = [
        'app/layout.tsx',
        'app/page.tsx',
        'lib/firebase.ts',
        'lib/validation.ts',
        'lib/auth.ts',
        'middleware.ts'
      ];

      await Promise.all(componentFiles.map(file => 
        fs.readFile(file, 'utf8').catch(() => {})
      ));
    }, metrics);

    // Write and delete test file
    await this.measureOperation('Write/Delete Test File', async () => {
      const testContent = 'Performance test file content';
      await fs.writeFile('perf-test.tmp', testContent);
      await fs.readFile('perf-test.tmp', 'utf8');
      await fs.unlink('perf-test.tmp');
    }, metrics);

    this.results.push({
      category: 'File System Operations',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // 4. Validation Performance
  async benchmarkValidationPerformance(): Promise<void> {
    console.log('\n✅ Benchmarking Validation Performance...');
    const metrics: PerformanceMetric[] = [];

    // Run validation tests multiple times
    for (let i = 0; i < 5; i++) {
      await this.measureOperation(`Validation Test Run ${i + 1}`, async () => {
        return new Promise<void>((resolve, reject) => {
          const childProcess = spawn('npm', ['run', 'test:mock'], { 
            stdio: 'pipe',
            cwd: process.cwd()
          });
          
          childProcess.on('close', (code: number | null) => {
            if (code === 0) resolve();
            else reject(new Error(`Validation test failed with code ${code}`));
          });
        });
      }, metrics);
    }

    this.results.push({
      category: 'Validation Performance',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // 5. Memory Usage
  async benchmarkMemoryUsage(): Promise<void> {
    console.log('\n🧠 Benchmarking Memory Usage...');
    const metrics: PerformanceMetric[] = [];

    await this.measureOperation('Memory Usage Analysis', async () => {
      const memUsage = process.memoryUsage();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memAfterGC = process.memoryUsage();

      return {
        beforeGC: memUsage,
        afterGC: memAfterGC,
        heapUsed: Math.round(memAfterGC.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memAfterGC.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memAfterGC.external / 1024 / 1024 * 100) / 100, // MB
        rss: Math.round(memAfterGC.rss / 1024 / 1024 * 100) / 100 // MB
      };
    }, metrics);

    this.results.push({
      category: 'Memory Usage',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // 6. Concurrency Performance
  async benchmarkConcurrency(): Promise<void> {
    console.log('\n🔄 Benchmarking Concurrency Performance...');
    const metrics: PerformanceMetric[] = [];

    // Parallel file operations
    await this.measureOperation('Parallel File Operations (10x)', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        fs.writeFile(`temp-${i}.tmp`, `Test content ${i}`)
          .then(() => fs.readFile(`temp-${i}.tmp`, 'utf8'))
          .then(() => fs.unlink(`temp-${i}.tmp`))
      );

      await Promise.all(operations);
    }, metrics);

    // Sequential file operations
    await this.measureOperation('Sequential File Operations (10x)', async () => {
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(`temp-seq-${i}.tmp`, `Test content ${i}`);
        await fs.readFile(`temp-seq-${i}.tmp`, 'utf8');
        await fs.unlink(`temp-seq-${i}.tmp`);
      }
    }, metrics);

    this.results.push({
      category: 'Concurrency Performance',
      metrics,
      totalTime: metrics.reduce((sum, m) => sum + m.duration, 0),
      averageTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
    });
  }

  // Helper method to measure operation performance
  private async measureOperation(
    name: string,
    operation: () => Promise<any>,
    metrics: PerformanceMetric[]
  ): Promise<void> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      metrics.push({
        name,
        duration,
        status: 'success',
        details: result
      });
      
      console.log(`  ✅ ${name}: ${Math.round(duration)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      
      metrics.push({
        name,
        duration,
        status: 'failed',
        details: error instanceof Error ? error.message : String(error)
      });
      
      console.log(`  ❌ ${name}: ${Math.round(duration)}ms (FAILED)`);
    }
  }

  // Print comprehensive performance summary
  private printSummary(totalTime: number): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(80));

    let totalOperations = 0;
    let successfulOperations = 0;

    this.results.forEach(result => {
      console.log(`\n📈 ${result.category}:`);
      console.log(`  Total Time: ${Math.round(result.totalTime)}ms`);
      console.log(`  Average Time: ${Math.round(result.averageTime)}ms`);
      console.log(`  Operations: ${result.metrics.length}`);
      
      const successful = result.metrics.filter(m => m.status === 'success').length;
      const failed = result.metrics.filter(m => m.status === 'failed').length;
      
      console.log(`  Success Rate: ${successful}/${result.metrics.length} (${Math.round((successful / result.metrics.length) * 100)}%)`);
      
      if (failed > 0) {
        console.log(`  Failed Operations: ${failed}`);
      }

      // Show fastest and slowest operations
      const sortedMetrics = [...result.metrics].sort((a, b) => a.duration - b.duration);
      if (sortedMetrics.length > 0) {
        console.log(`  Fastest: ${sortedMetrics[0].name} (${Math.round(sortedMetrics[0].duration)}ms)`);
        console.log(`  Slowest: ${sortedMetrics[sortedMetrics.length - 1].name} (${Math.round(sortedMetrics[sortedMetrics.length - 1].duration)}ms)`);
      }

      totalOperations += result.metrics.length;
      successfulOperations += successful;
    });

    // Overall summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 OVERALL PERFORMANCE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Benchmark Time: ${Math.round(totalTime)}ms (${Math.round(totalTime / 1000 * 100) / 100}s)`);
    console.log(`Total Operations Tested: ${totalOperations}`);
    console.log(`Overall Success Rate: ${Math.round((successfulOperations / totalOperations) * 100)}%`);

    // Performance ratings
    this.printPerformanceRatings();

    // Memory summary
    const memoryMetrics = this.results.find(r => r.category === 'Memory Usage');
    if (memoryMetrics && memoryMetrics.metrics[0]?.details) {
      const memDetails = memoryMetrics.metrics[0].details;
      console.log('\n🧠 Memory Usage Summary:');
      console.log(`  Heap Used: ${memDetails.heapUsed}MB`);
      console.log(`  Heap Total: ${memDetails.heapTotal}MB`);
      console.log(`  RSS: ${memDetails.rss}MB`);
      console.log(`  External: ${memDetails.external}MB`);
    }

    console.log('\n🎉 Performance benchmark completed!');
  }

  private printPerformanceRatings(): void {
    console.log('\n⭐ Performance Ratings:');

    this.results.forEach(result => {
      let rating = '';
      let color = '';

      // Rate based on average time and category
      switch (result.category) {
        case 'Build Performance':
          if (result.averageTime < 30000) rating = '🟢 Excellent';
          else if (result.averageTime < 60000) rating = '🟡 Good';
          else rating = '🔴 Needs Improvement';
          break;
        
        case 'Startup Performance':
          if (result.averageTime < 5000) rating = '🟢 Excellent';
          else if (result.averageTime < 10000) rating = '🟡 Good';
          else rating = '🔴 Needs Improvement';
          break;
        
        case 'File System Operations':
          if (result.averageTime < 10) rating = '🟢 Excellent';
          else if (result.averageTime < 50) rating = '🟡 Good';
          else rating = '🔴 Needs Improvement';
          break;
        
        case 'Validation Performance':
          if (result.averageTime < 1000) rating = '🟢 Excellent';
          else if (result.averageTime < 3000) rating = '🟡 Good';
          else rating = '🔴 Needs Improvement';
          break;
        
        default:
          if (result.averageTime < 100) rating = '🟢 Excellent';
          else if (result.averageTime < 500) rating = '🟡 Good';
          else rating = '🔴 Needs Improvement';
      }

      console.log(`  ${result.category}: ${rating} (${Math.round(result.averageTime)}ms avg)`);
    });
  }
}

// Main execution
async function main() {
  const benchmark = new PerformanceBenchmark();
  await benchmark.runAllBenchmarks();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PerformanceBenchmark };
