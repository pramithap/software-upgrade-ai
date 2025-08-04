import { NextResponse } from 'next/server';
import { RepositoryScanner } from '@/lib/scanner/repositoryScanner';
import { ScanResult } from '@/lib/scanner/types';

// Store ongoing scans
const scans = new Map<string, {
  progress: number;
  results: any[];
  error?: string;
}>();

export async function POST(request: Request) {
  try {
    const { repositories, scanType } = await request.json();

    if (!Array.isArray(repositories) || repositories.length === 0) {
      return NextResponse.json(
        { error: 'repositories must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!['full', 'incremental'].includes(scanType)) {
      return NextResponse.json(
        { error: 'scanType must be either "full" or "incremental"' },
        { status: 400 }
      );
    }

    // Generate a unique scan ID
    const scanId = Date.now().toString();
    
    // Initialize scan status
    scans.set(scanId, {
      progress: 0,
      results: [],
    });

    // Start the scan process asynchronously
    processScan(scanId, repositories, scanType).catch(error => {
      console.error('Error in background scan:', error);
      scans.get(scanId)!.error = error instanceof Error ? error.message : 'Unknown error occurred';
    });

    // Return immediately with the scan ID
    return NextResponse.json({ scanId });
  } catch (error) {
    console.error('Error processing scan request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scanId = url.searchParams.get('scanId');

  if (!scanId) {
    return NextResponse.json(
      { error: 'scanId is required' },
      { status: 400 }
    );
  }

  const scan = scans.get(scanId);
  if (!scan) {
    return NextResponse.json(
      { error: 'Scan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    progress: scan.progress,
    results: scan.results,
    error: scan.error
  });
}

async function processScan(scanId: string, repositories: string[], scanType: 'full' | 'incremental') {
  const scanner = new RepositoryScanner();
  const scan = scans.get(scanId)!;
  const totalRepos = repositories.length;
  
  for (const [index, repoUrl] of repositories.entries()) {
    try {
      console.log(`Processing repository: ${repoUrl}`);
      const scanResult = await scanner.scanRepository(repoUrl, scanType);
      
      scan.results.push({
        repository: repoUrl,
        data: {
          dependencies: scanResult.dependencies,
          status: scanResult.success ? 'completed' : 'error',
          error: scanResult.error
        }
      });
    } catch (error) {
      console.error(`Error processing repository ${repoUrl}:`, error);
      scan.results.push({
        repository: repoUrl,
        data: {
          dependencies: [],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      });
    }

    // Update progress
    scan.progress = Math.round(((index + 1) / totalRepos) * 100);
  }
}

// CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
