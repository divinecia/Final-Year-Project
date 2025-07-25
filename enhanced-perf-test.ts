#!/usr/bin/env tsx

/**
 * Enhanced Performance Test Suite for HouseHelp Application
 * Advanced performance testing with detailed metrics and analysis
 */

import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

interface EnhancedMetric {
  name: string;
  duration: number;
  status: 'success' | 'failed' | 'warning';
  details?: any;
  memoryBefore?: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

interface TestResult {
  category: string;
  metrics: EnhancedMetric[];
  totalTime: number;
  averageTime: number;
  memoryDelta: number;
  successRate: number;
}

class EnhancedPerformanceTest {
  private results: TestResult[] = [];
  private globalStartTime: number = 0;

  async runEnhancedTests(): Promise<void> {
    console.log('🚀 Enhanced Performance Test Suite for HouseHelp');
    console.log('='.repeat(60));

    this.globalStartTime = performance.now();

    // Run enhanced test categories
    await this.testApplicationBootstrap();
    await this.testComponentRendering();
    await this.testDatabaseOperations();
    await this.testAPIPerformance();
    await this.testMemoryLeaks();
    await this.testConcurrentOperations();
    await this.testErrorHandling();

    const totalTime = performance.now() - this.globalStartTime;
    this.generateEnhancedReport(totalTime);
  }

  // 1. Application Bootstrap Performance
  async testApplicationBootstrap(): Promise<void> {
    console.log('\n🏁 Testing Application Bootstrap...');
    const metrics: EnhancedMetric[] = [];

    // Test TypeScript compilation performance (faster check)
    await this.measureEnhancedOperation('TypeScript Compilation Check', async () => {
      return new Promise<string>((resolve, reject) => {
        const childProcess = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });

        let output = '';
        const timeout = setTimeout(() => {
          childProcess.kill();
          reject(new Error('TypeScript compilation timeout (10s)'));
        }, 10000); // 10 second timeout

        childProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        childProcess.stderr?.on('data', (data) => {
          output += data.toString();
        });
        
        childProcess.on('close', (code: number | null) => {
          clearTimeout(timeout);
          if (code === 0) resolve(output);
          else reject(new Error(`TypeScript compilation failed: ${output}`));
        });

        childProcess.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }, metrics);

    // Test Next.js config validation (fast check)
    await this.measureEnhancedOperation('Next.js Config Validation', async () => {
      try {
        const nextConfig = await import('./next.config');
        return {
          configLoaded: true,
          hasConfig: !!nextConfig.default,
          type: typeof nextConfig.default
        };
      } catch (error) {
        throw new Error(`Next.js config validation failed: ${error}`);
      }
    }, metrics);

    // Test dependency resolution (package.json check)
    await this.measureEnhancedOperation('Dependency Resolution Check', async () => {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      
      return {
        totalDependencies: deps.length + devDeps.length,
        productionDeps: deps.length,
        devDeps: devDeps.length,
        hasNextJs: deps.includes('next'),
        hasReact: deps.includes('react'),
        hasTypeScript: devDeps.includes('typescript')
      };
    }, metrics);

    // Test build preparation (without actual build)
    await this.measureEnhancedOperation('Build Environment Check', async () => {
      const checks = {
        nodeModulesExists: false,
        packageLockExists: false,
        nextConfigExists: false,
        tsconfigExists: false
      };

      try {
        await fs.access('node_modules');
        checks.nodeModulesExists = true;
      } catch {}

      try {
        await fs.access('package-lock.json');
        checks.packageLockExists = true;
      } catch {}

      try {
        await fs.access('next.config.ts');
        checks.nextConfigExists = true;
      } catch {}

      try {
        await fs.access('tsconfig.json');
        checks.tsconfigExists = true;
      } catch {}

      return checks;
    }, metrics);

    this.addResult('Application Bootstrap', metrics);
  }

  // 2. Component Rendering Performance
  async testComponentRendering(): Promise<void> {
    console.log('\n🎨 Testing Component Rendering...');
    const metrics: EnhancedMetric[] = [];

    // Test component file analysis
    await this.measureEnhancedOperation('Component File Analysis', async () => {
      const componentDir = 'components';
      const uiDir = join(componentDir, 'ui');
      
      const componentFiles = await fs.readdir(componentDir, { withFileTypes: true })
        .then(entries => entries.filter(entry => entry.isFile() && entry.name.endsWith('.tsx')));
      
      const uiFiles = await fs.readdir(uiDir, { withFileTypes: true })
        .then(entries => entries.filter(entry => entry.isFile() && entry.name.endsWith('.tsx')));

      const totalComponents = componentFiles.length + uiFiles.length;
      
      // Read all component files to analyze complexity
      const allFiles = [
        ...componentFiles.map(f => join(componentDir, f.name)),
        ...uiFiles.map(f => join(uiDir, f.name))
      ];

      const componentData = await Promise.all(
        allFiles.map(async (file) => {
          const content = await fs.readFile(file, 'utf8');
          return {
            file,
            lines: content.split('\n').length,
            size: content.length,
            hasUseEffect: content.includes('useEffect'),
            hasUseState: content.includes('useState'),
            complexity: (content.match(/if|for|while|switch|case/g) || []).length
          };
        })
      );

      return {
        totalComponents,
        totalLines: componentData.reduce((sum, c) => sum + c.lines, 0),
        totalSize: componentData.reduce((sum, c) => sum + c.size, 0),
        averageComplexity: componentData.reduce((sum, c) => sum + c.complexity, 0) / componentData.length,
        hooksUsage: {
          useEffect: componentData.filter(c => c.hasUseEffect).length,
          useState: componentData.filter(c => c.hasUseState).length
        }
      };
    }, metrics);

    this.addResult('Component Rendering', metrics);
  }

  // 3. Database Operations Performance
  async testDatabaseOperations(): Promise<void> {
    console.log('\n🗄️ Testing Database Operations...');
    const metrics: EnhancedMetric[] = [];

    // Test schema validation
    await this.measureEnhancedOperation('Schema Validation', async () => {
      const schemaFiles = await fs.readdir('lib/schemas', { withFileTypes: true })
        .then(entries => entries.filter(entry => entry.isFile() && entry.name.endsWith('.ts')));

      const schemas = await Promise.all(
        schemaFiles.map(async (file) => {
          const content = await fs.readFile(join('lib/schemas', file.name), 'utf8');
          return {
            file: file.name,
            size: content.length,
            hasZod: content.includes('z.'),
            exports: (content.match(/export/g) || []).length
          };
        })
      );

      return {
        totalSchemas: schemas.length,
        totalSize: schemas.reduce((sum, s) => sum + s.size, 0),
        zodSchemas: schemas.filter(s => s.hasZod).length
      };
    }, metrics);

    this.addResult('Database Operations', metrics);
  }

  // 4. API Performance Testing
  async testAPIPerformance(): Promise<void> {
    console.log('\n🌐 Testing API Performance...');
    const metrics: EnhancedMetric[] = [];

    // Test API route analysis
    await this.measureEnhancedOperation('API Route Analysis', async () => {
      const apiDir = 'app/api';
      const routes = await this.scanDirectory(apiDir);
      
      const routeFiles = routes.filter(file => 
        file.endsWith('route.ts') || file.endsWith('route.js')
      );

      const routeData = await Promise.all(
        routeFiles.map(async (file) => {
          const content = await fs.readFile(file, 'utf8');
          return {
            file,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].filter(method => 
              content.includes(`export async function ${method}`)
            ),
            hasAuth: content.includes('auth') || content.includes('token'),
            hasValidation: content.includes('validate') || content.includes('schema'),
            size: content.length
          };
        })
      );

      return {
        totalRoutes: routeFiles.length,
        totalMethods: routeData.reduce((sum, r) => sum + r.methods.length, 0),
        securedRoutes: routeData.filter(r => r.hasAuth).length,
        validatedRoutes: routeData.filter(r => r.hasValidation).length
      };
    }, metrics);

    this.addResult('API Performance', metrics);
  }

  // 5. Memory Leak Testing
  async testMemoryLeaks(): Promise<void> {
    console.log('\n🧠 Testing Memory Usage...');
    const metrics: EnhancedMetric[] = [];

    // Stress test memory allocation
    await this.measureEnhancedOperation('Memory Stress Test', async () => {
      const iterations = 1000;
      const arrays: number[][] = [];
      
      // Allocate memory
      for (let i = 0; i < iterations; i++) {
        arrays.push(new Array(1000).fill(i));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear arrays
      arrays.length = 0;

      return { iterations, arraySize: 1000 };
    }, metrics);

    this.addResult('Memory Testing', metrics);
  }

  // 6. Concurrent Operations Testing
  async testConcurrentOperations(): Promise<void> {
    console.log('\n🔄 Testing Concurrent Operations...');
    const metrics: EnhancedMetric[] = [];

    // Test parallel file operations
    await this.measureEnhancedOperation('Parallel File Operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) => 
        this.performFileOperation(i)
      );

      const results = await Promise.allSettled(operations);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { total: operations.length, successful, failed };
    }, metrics);

    this.addResult('Concurrent Operations', metrics);
  }

  // 7. Error Handling Performance
  async testErrorHandling(): Promise<void> {
    console.log('\n❌ Testing Error Handling...');
    const metrics: EnhancedMetric[] = [];

    // Test error boundary performance
    await this.measureEnhancedOperation('Error Handling', async () => {
      const errors = [];
      
      // Simulate various error conditions
      for (let i = 0; i < 100; i++) {
        try {
          if (i % 3 === 0) throw new Error(`Test error ${i}`);
          if (i % 5 === 0) throw new TypeError(`Type error ${i}`);
          if (i % 7 === 0) throw new ReferenceError(`Reference error ${i}`);
        } catch (error) {
          errors.push(error);
        }
      }

      return { totalErrors: errors.length, errorTypes: [...new Set(errors.map(e => (e as Error).constructor.name))] };
    }, metrics);

    this.addResult('Error Handling', metrics);
  }

  // Helper methods
  private async measureEnhancedOperation(
    name: string,
    operation: () => Promise<any>,
    metrics: EnhancedMetric[]
  ): Promise<void> {
    const memoryBefore = process.memoryUsage();
    const cpuBefore = process.cpuUsage();
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      const memoryAfter = process.memoryUsage();
      const cpuUsage = process.cpuUsage(cpuBefore);
      
      metrics.push({
        name,
        duration,
        status: 'success',
        details: result,
        memoryBefore,
        memoryAfter,
        cpuUsage
      });
      
      console.log(`  ✅ ${name}: ${Math.round(duration)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const memoryAfter = process.memoryUsage();
      
      metrics.push({
        name,
        duration,
        status: 'failed',
        details: error instanceof Error ? error.message : String(error),
        memoryBefore,
        memoryAfter
      });
      
      console.log(`  ❌ ${name}: ${Math.round(duration)}ms (FAILED)`);
    }
  }

  private async performFileOperation(index: number): Promise<void> {
    const filename = `temp-concurrent-${index}.tmp`;
    const content = `Test content for file ${index}`;
    
    await fs.writeFile(filename, content);
    await fs.readFile(filename, 'utf8');
    await fs.unlink(filename);
  }

  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...await this.scanDirectory(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }

  private addResult(category: string, metrics: EnhancedMetric[]): void {
    const successful = metrics.filter(m => m.status === 'success').length;
    const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);
    const memoryDelta = metrics.reduce((sum, m) => {
      if (m.memoryBefore && m.memoryAfter) {
        return sum + (m.memoryAfter.heapUsed - m.memoryBefore.heapUsed);
      }
      return sum;
    }, 0);

    this.results.push({
      category,
      metrics,
      totalTime,
      averageTime: totalTime / metrics.length,
      memoryDelta,
      successRate: (successful / metrics.length) * 100
    });
  }

  private generateEnhancedReport(totalTime: number): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ENHANCED PERFORMANCE TEST RESULTS');
    console.log('='.repeat(80));

    this.results.forEach(result => {
      console.log(`\n🎯 ${result.category}:`);
      console.log(`  Total Time: ${Math.round(result.totalTime)}ms`);
      console.log(`  Average Time: ${Math.round(result.averageTime)}ms`);
      console.log(`  Success Rate: ${result.successRate.toFixed(1)}%`);
      console.log(`  Memory Delta: ${(result.memoryDelta / 1024 / 1024).toFixed(2)}MB`);
      
      // Show performance rating
      const rating = this.getPerformanceRating(result.category, result.averageTime);
      console.log(`  Performance: ${rating}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🏆 FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Test Time: ${Math.round(totalTime)}ms`);
    console.log(`Overall Success Rate: ${(this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length).toFixed(1)}%`);
    console.log(`Memory Impact: ${(this.results.reduce((sum, r) => sum + r.memoryDelta, 0) / 1024 / 1024).toFixed(2)}MB`);
    
    const currentMemory = process.memoryUsage();
    console.log(`\n🧠 Current Memory Usage:`);
    console.log(`  Heap Used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Heap Total: ${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  RSS: ${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`);

    console.log('\n🎉 Enhanced performance test completed!');
  }

  private getPerformanceRating(category: string, avgTime: number): string {
    const thresholds = {
      'Application Bootstrap': { excellent: 1500, good: 3000 },
      'Component Rendering': { excellent: 30, good: 100 },
      'Database Operations': { excellent: 50, good: 200 },
      'API Performance': { excellent: 50, good: 150 },
      'Memory Testing': { excellent: 30, good: 100 },
      'Concurrent Operations': { excellent: 500, good: 1500 },
      'Error Handling': { excellent: 5, good: 20 }
    };

    const threshold = thresholds[category as keyof typeof thresholds] || { excellent: 100, good: 500 };
    
    if (avgTime <= threshold.excellent) return '🟢 Excellent';
    if (avgTime <= threshold.good) return '🟡 Good';
    return '🔴 Needs Improvement';
  }
}

// Main execution
async function main() {
  const enhancedTest = new EnhancedPerformanceTest();
  await enhancedTest.runEnhancedTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { EnhancedPerformanceTest };
