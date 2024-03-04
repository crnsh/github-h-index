import Head from "next/head";
import Link from "next/link";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/ModeToggle";

interface Repository {
  name: string;
  description: string | null;
  stargazers_count: number;
}

function calculateHIndex(citations: number[]): number {
  citations.sort((a, b) => b - a);

  let h = 0;
  while (h < citations.length && citations[h] > h) {
    h++;
  }
  
  return h;
}

function OutputView( { repositories, isLoading } : { repositories: Repository[], isLoading: boolean } ) {

  let totalStars = repositories.reduce((sum, x) => sum + x.stargazers_count, 0)

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 w-full flex flex-row place-content-between">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          H-Index : {calculateHIndex(repositories.map((repo) => repo.stargazers_count))}
        </h3>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Total Stars : {totalStars}
        </h3>
      </div>
      <Separator className="my-4" />
      <div className=" max-h-[700px] w-full custom-gray-scroll overflow-autocenter max-w-4xl space-x-4">
        <Table>
          <TableHeader className="max-w">
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Stars</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ?
          ([1,2,3,4,5,6].map(() => (
            <TableBody>
              <TableRow key='t'>
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[400px]" />
                </TableCell>
                <TableCell className="flex justify-end">
                  <Skeleton className="h-4 w-10" />
                </TableCell>
              </TableRow>    
            </TableBody>
            ))) : 
            (repositories.map((repo) => (
            <TableBody>
              <TableRow key={repo.name}>
                <TableCell className="font-medium">{repo.name}</TableCell>
                <TableCell>{repo.description}</TableCell>
                <TableCell className="text-right">{repo.stargazers_count}</TableCell>
              </TableRow>
            </TableBody>
            )))}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{totalStars}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>

  )
}

export default function Home() {

  const [username, setUsername] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchKey, setFetchKey] = useState<number>(0);

const fetchRepositories = async () => {
  setRepositories([]);
  setIsLoading(true);
  setFetchKey(prevKey => prevKey + 1); // Update the key to force re-render

  let page = 1;
  const perPage = 100; // Max per page allowed by GitHub API
  let allRepositories: Repository[] = [];
  let fetchMore = true;

  while (fetchMore) {
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const repos: Repository[] = await response.json();
      
      // If we get fewer repos than we requested, it's the last page
      fetchMore = repos.length === perPage;
      
      allRepositories = [...allRepositories, ...repos];
      page++;
    } catch (error) {
      console.error('Fetching repositories failed:', error);
      fetchMore = false; // Stop fetching if there's an error
    }
  }

  setRepositories(allRepositories);
  setIsLoading(false);
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchRepositories();
  };

  return (
    <div key="1" className="px-4 py-6 md:py-12 lg:py-16 flex flex-col min-h-screen">
      <div className="space-y-5 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 32 32" height={100} width={100} shape-rendering="crispEdges">
          <metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
          <path stroke="#000000" d="M16 1h2M15 2h1M18 2h2M14 3h1M20 3h2M13 4h1M22 4h2M12 5h1M24 5h2M11 6h1M26 6h1M10 7h1M26 7h1M9 8h1M25 8h1M8 9h1M24 9h1M7 10h1M24 10h1M6 11h1M24 11h1M6 12h1M25 12h1M5 13h1M25 13h1M5 14h1M26 14h1M4 15h1M26 15h1M4 16h1M27 16h1M3 17h1M27 17h1M3 18h1M28 18h1M3 19h3M28 19h1M5 20h1M27 20h1M5 21h1M18 21h1M27 21h1M4 22h1M17 22h2M26 22h1M4 23h1M17 23h1M19 23h1M26 23h1M3 24h1M16 24h1M19 24h1M25 24h1M3 25h1M16 25h1M20 25h1M25 25h1M3 26h3M15 26h1M20 26h1M24 26h1M6 27h2M15 27h1M21 27h1M24 27h1M8 28h2M14 28h1M21 28h3M10 29h2M14 29h1M12 30h3" />
          <path stroke="#3368dc" d="M16 2h2M15 3h5M14 4h8M13 5h11M12 6h1M15 6h11M11 7h2M17 7h9M10 8h2M19 8h6M9 9h3M21 9h3M8 10h3M7 11h4M7 12h3M6 13h3M6 14h3M5 15h3M5 16h3M10 16h1M4 17h3M12 17h1M4 18h3M14 18h1M16 19h1M18 20h1M19 22h1M20 24h1M21 26h1" />
          <path stroke="#3dabea" d="M13 6h2M13 7h4M12 8h7M12 9h9M11 10h12M11 11h12M10 12h12M23 12h2M10 13h12M23 13h2M9 14h12M22 14h4M9 15h12M22 15h4M8 16h2M11 16h9M21 16h6M8 17h4M13 17h7M21 17h6M7 18h7M15 18h4M20 18h8M7 19h9M17 19h2M20 19h8M6 20h11M19 20h8M6 21h11M19 21h8M5 22h11M20 22h6M5 23h11M20 23h6M4 24h11M21 24h4M4 25h11M21 25h4M6 26h8M22 26h2M8 27h6M22 27h2M10 28h3M12 29h1" />
          <path stroke="#5becf1" d="M23 10h1M23 11h1M22 12h1M22 13h1M21 14h1M21 15h1M20 16h1M20 17h1M19 18h1M19 19h1M17 20h1M17 21h1M16 22h1M16 23h1M15 24h1M15 25h1M14 26h1M14 27h1M13 28h1M13 29h1" />
          <path stroke="#222a5c" d="M9 13h1M8 15h1M7 17h1M6 19h1" />
        </svg>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">GitHub H-Index</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter a GitHub username to see h-index</p>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
          <div className="grid grid-cols-5 gap-4 w-full">
            <Input 
              className="col-span-3" 
              id="username" 
              placeholder="Enter a username" 
              onChange={e => setUsername(e.target.value)}
            />
            <div>
              <Button type="submit" className="w-full">Submit</Button>
            </div>
            <ModeToggle/>
          </div>
        </form>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md max-w-4xl w-full">
          <OutputView key={fetchKey} repositories={repositories.sort((a,b)=>b.stargazers_count-a.stargazers_count)} isLoading={isLoading} />
        </div>
      </div>
      <footer className="text-center text-gray-700 mt-auto">
        <p className="text-sm text-muted-foreground">Built with ❤️ by <a className=" text-blue-500" href="https://twitter.com/crnshx">Karan</a></p>
      </footer>
    </div>
  )
}