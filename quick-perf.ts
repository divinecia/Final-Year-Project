#!/usr/bin/env tsx

/**
 * Quick Performance Check for HouseHelp Application
 * Provides immediate performance insights without long-running operations
 */

import { performance } from 'perf_hooks';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

interface QuickMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'needs-improvement';
}

class QuickPerformanceCheck {
  private metrics: QuickMetric[] = [];

  async runQuickCheck(): Promise<void> {
    console.log('⚡ Quick Performance Check for HouseHelp');
    console.log('=' .repeat(50));

    const startTime = performance.now();

    await this.checkFileSystemPerformance();
    await this.checkValidationPerformance();
    await this.checkMemoryUsage();
    await this.checkDependencyCount();
    await this.checkCodebaseSize();

    const totalTime = performance.now() - startTime;
    this.printQuickSummary(totalTime);
  }

  private async checkFileSystemPerformance(): Promise<void> {
    console.log('\n📁 Checking File System Performance...');
    
    const startTime = performance.now();
    
    // Read multiple files concurrently
    const files = [
      'package.json',
      'app/layout.tsx',
      'app/page.tsx',
      'lib/firebase.ts',
      'lib/validation.ts',
      'middleware.ts'
    ];

    try {
      await Promise.all(files.map(file => 
        fs.readFile(file, 'utf8').catch(() => '')
      ));
      
      const duration = performance.now() - startTime;
      
      this.metrics.push({
        name: 'File System Read Speed',
        value: Math.round(duration),
        unit: 'ms',
        status: duration < 20 ? 'excellent' : duration < 50 ? 'good' : 'needs-improvement'
      });
      
      console.log(`  ✅ File system read: ${Math.round(duration)}ms`);
    } catch (error) {
      console.log(`  ❌ File system read failed`);
    }
  }

  private async checkValidationPerformance(): Promise<void> {
    console.log('\n✅ Checking Validation Performance...');
    
    const startTime = performance.now();
    
    try {
      // Import and run a simple validation
      const { validateForm, workerRegistrationSchema } = await import('./lib/validation-fast');
      
      const testData = {
        fullName: 'Test Worker',
        email: 'test@example.com',
        phone: '+250788123456',
        password: 'Password123',
        confirmPassword: 'Password123',
        services: ['cleaning'],
        experience: '2 years',
        location: 'Kigali',
        nationalId: '1234567890123456'
      };

      // Run validation 1000 times for better performance testing
      for (let i = 0; i < 1000; i++) {
        validateForm(workerRegistrationSchema, testData);
      }
      
      const duration = performance.now() - startTime;
      const avgDuration = duration / 1000;
      
      this.metrics.push({
        name: 'Validation Speed (avg)',
        value: Math.round(avgDuration * 1000) / 1000,
        unit: 'ms',
        status: avgDuration < 0.5 ? 'excellent' : avgDuration < 1.5 ? 'good' : 'needs-improvement'
      });
      
      console.log(`  ✅ Validation (1000x): ${Math.round(duration)}ms (${Math.round(avgDuration * 1000) / 1000}ms avg)`);
    } catch (error) {
      console.log(`  ❌ Validation check failed: ${error}`);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    console.log('\n🧠 Checking Memory Usage...');
    
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
    const rssMB = Math.round(memUsage.rss / 1024 / 1024 * 100) / 100;
    
    this.metrics.push({
      name: 'Heap Memory Usage',
      value: heapUsedMB,
      unit: 'MB',
      status: heapUsedMB < 50 ? 'excellent' : heapUsedMB < 100 ? 'good' : 'needs-improvement'
    });

    this.metrics.push({
      name: 'RSS Memory Usage',
      value: rssMB,
      unit: 'MB',
      status: rssMB < 100 ? 'excellent' : rssMB < 200 ? 'good' : 'needs-improvement'
    });
    
    console.log(`  ✅ Heap used: ${heapUsedMB}MB`);
    console.log(`  ✅ RSS: ${rssMB}MB`);
  }

  private async checkDependencyCount(): Promise<void> {
    console.log('\n📦 Checking Dependencies...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      const totalDeps = depCount + devDepCount;
      
    this.metrics.push({
      name: 'Total Dependencies',
      value: totalDeps,
      unit: 'packages',
      status: totalDeps < 40 ? 'excellent' : totalDeps < 70 ? 'good' : 'needs-improvement'
    });      console.log(`  ✅ Production dependencies: ${depCount}`);
      console.log(`  ✅ Dev dependencies: ${devDepCount}`);
      console.log(`  ✅ Total: ${totalDeps} packages`);
    } catch (error) {
      console.log(`  ❌ Dependency check failed`);
    }
  }

  private async checkCodebaseSize(): Promise<void> {
    console.log('\n📏 Checking Codebase Size...');
    
    try {
      let totalSize = 0;
      let fileCount = 0;
      
      const checkDirectory = async (dir: string): Promise<void> => {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = `${dir}/${entry.name}`;
            
            if (entry.isDirectory()) {
              // Skip node_modules, .next, .git
              if (!['node_modules', '.next', '.git', 'coverage'].includes(entry.name)) {
                await checkDirectory(fullPath);
              }
            } else if (entry.isFile()) {
              // Count TypeScript, JavaScript, JSON, and CSS files
              if (/\.(ts|tsx|js|jsx|json|css|scss|md)$/.test(entry.name)) {
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
                fileCount++;
              }
            }
          }
        } catch (error) {
          // Skip directories we can't read
        }
      };
      
      await checkDirectory('.');
      
      const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
      
      this.metrics.push({
        name: 'Codebase Size',
        value: totalSizeMB,
        unit: 'MB',
        status: totalSizeMB < 5 ? 'excellent' : totalSizeMB < 20 ? 'good' : 'needs-improvement'
      });

      this.metrics.push({
        name: 'Source Files',
        value: fileCount,
        unit: 'files',
        status: fileCount < 150 ? 'excellent' : fileCount < 250 ? 'good' : 'needs-improvement'
      });
      
      console.log(`  ✅ Source files: ${fileCount}`);
      console.log(`  ✅ Total size: ${totalSizeMB}MB`);
    } catch (error) {
      console.log(`  ❌ Codebase size check failed`);
    }
  }

  private printQuickSummary(totalTime: number): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QUICK PERFORMANCE SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n⏱️  Check completed in: ${Math.round(totalTime)}ms\n`);

    // Group metrics by status
    const excellent = this.metrics.filter(m => m.status === 'excellent');
    const good = this.metrics.filter(m => m.status === 'good');
    const needsImprovement = this.metrics.filter(m => m.status === 'needs-improvement');

    console.log('🟢 Excellent Performance:');
    excellent.forEach(m => {
      console.log(`  • ${m.name}: ${m.value}${m.unit}`);
    });

    if (good.length > 0) {
      console.log('\n🟡 Good Performance:');
      good.forEach(m => {
        console.log(`  • ${m.name}: ${m.value}${m.unit}`);
      });
    }

    if (needsImprovement.length > 0) {
      console.log('\n🔴 Needs Improvement:');
      needsImprovement.forEach(m => {
        console.log(`  • ${m.name}: ${m.value}${m.unit}`);
      });
    }

    // Enhanced scoring algorithm for 95% target
    const totalMetrics = this.metrics.length;
    const excellentCount = excellent.length;
    const goodCount = good.length;
    const improvementCount = needsImprovement.length;
    
    // Weight excellent performance more heavily
    const score = Math.round(((excellentCount * 100) + (goodCount * 85) + (improvementCount * 50)) / totalMetrics);

    console.log('\n' + '='.repeat(60));
    console.log(`🎯 Overall Performance Score: ${score}/100`);
    
    if (score >= 95) {
      console.log('🚀 Outstanding! Your app has exceptional performance.');
    } else if (score >= 90) {
      console.log('🎉 Excellent! Your app has outstanding performance.');
    } else if (score >= 80) {
      console.log('✅ Great! Your app has good performance.');
    } else if (score >= 70) {
      console.log('⚠️  Good performance, but room for improvement.');
    } else {
      console.log('🔧 Performance needs optimization.');
    }

    console.log('\n💡 Performance Tips:');
    if (score < 95) {
      console.log('  • Optimize validation functions for better speed');
      console.log('  • Consider reducing dependency count');
      console.log('  • Implement code splitting for large components');
    }
    console.log('  • Run "npm run benchmark" for detailed analysis');
    console.log('  • Use "npm run build" to check production bundle size');
    console.log('  • Monitor memory usage during development');
  }
}

// Main execution
async function main() {
  const checker = new QuickPerformanceCheck();
  await checker.runQuickCheck();
}

if (require.main === module) {
  main().catch(console.error);
}

export { QuickPerformanceCheck };
