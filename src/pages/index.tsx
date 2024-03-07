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
  owner: { login: string }
}

function calculateHIndex(citations: number[]): number {
  citations.sort((a, b) => b - a);

  let h = 0;
  while (h < citations.length && citations[h]! > h) {
    h++;
  }
  
  return h;
}

function OutputView( { repositories, isLoading } : { repositories: Repository[], isLoading: boolean } ) {

  const totalStars = repositories.reduce((sum, x) => sum + x.stargazers_count, 0)

  return (
    isLoading ? (<div className="flex flex-col max-h-[50vh]">
      <div className="px-4 pt-4 w-full flex flex-row place-content-between">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
          H-Index: {calculateHIndex(repositories.map((repo) => repo.stargazers_count))}
        </h2>
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
          All Stars: {totalStars}
        </h2>
      </div>
      <Separator className="my-4" />
      <div className=" w-full custom-gray-scroll overflow-autocenter max-w-4xl space-x-4">
        <Table key='now'>
          <TableHeader className="max-w">
            <TableRow>
              <TableHead className="w-[50px] overflow-auto">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Stars</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1,2,3,4,5,6].map(() => (
              <TableRow key='t'>
                <TableCell className="font-medium">
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell className="flex justify-end">
                  <Skeleton className="h-5" />
                </TableCell>
              </TableRow>   
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{totalStars}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>) : (
    <div className="flex flex-col max-h-[50vh]">
      <div className="px-4 pt-4 w-full flex flex-row place-content-between">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
          H-Index: {calculateHIndex(repositories.map((repo) => repo.stargazers_count))}
        </h2>
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
          All Stars: {totalStars}
        </h2>
      </div>
      <Separator className="my-4" />
      <div className=" w-full custom-gray-scroll overflow-autocenter max-w-4xl space-x-4">
        <Table key='not-now'>
          <TableHeader className="max-w">
            <TableRow>
              <TableHead className="w-[50px] overflow-auto">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Stars</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {repositories.map((repo) => (
            <TableRow key={repo.name}>
              <TableCell className="font-medium">
                <a className="text-blue-500" href={`https://github.com/${repo.owner.login}/${repo.name}`}>{repo.name}</a>
              </TableCell>
              <TableCell>{repo.description}</TableCell>
              <TableCell className="text-right">{repo.stargazers_count}</TableCell>
            </TableRow>
          ))}
          </TableBody>
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
  )
}

export default function Home() {

  const [username, setUsername] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchKey, setFetchKey] = useState<number>(0);

  const fetchAllData = async () => {
    setRepositories([]);
    setIsLoading(true);
    setFetchKey(prevKey => prevKey + 1); // Update the key to force re-render
  
    const fetchOrgRepos = async (org: any) => {
      let page = 1;
      let fetchMore = true;
      const orgRepos = [];
  
      while (fetchMore) {
        const url = `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const repos = await response.json();
          fetchMore = repos.length === 100;
          orgRepos.push(...repos);
          page++;
        } catch (error) {
          console.error(`Fetching organization (${org}) repositories failed:`, error);
          fetchMore = false;
        }
      }
  
      return orgRepos;
    };
  
    const fetchUserAndOrgRepos = async () => {
      let allRepositories = [];
      let page = 1;
      let fetchMore = true;
  
      // Fetch user repositories
      while (fetchMore) {
        const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const repos = await response.json();
          fetchMore = repos.length === 100;
          allRepositories.push(...repos);
          page++;
        } catch (error) {
          console.error('Fetching user repositories failed:', error);
          fetchMore = false;
        }
      }
  
      // Fetch organizations
      try {
        const orgsResponse = await fetch(`https://api.github.com/users/${username}/orgs`);
        if (!orgsResponse.ok) {
          throw new Error(`HTTP error! status: ${orgsResponse.status}`);
        }
        const orgs = await orgsResponse.json();
  
        console.log(orgs)
  
        // Fetch repositories for each organization
        for (const org of orgs) {
          const orgRepos = await fetchOrgRepos(org.login);
          allRepositories.push(...orgRepos);
        }
      } catch (error) {
        console.error('Fetching organizations failed:', error);
      }
  
      return allRepositories;
    };
  
    const allRepos = await fetchUserAndOrgRepos();
    setRepositories(allRepos);
    setIsLoading(false);
  };
  
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchAllData();
  };

  return (
    <div key="1" className="px-4 pb-4 pt-10 flex flex-col min-h-screen">
      <div className="space-y-5 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 32 32" height={100} width={100} shapeRendering="crispEdges">
          <metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
          <path stroke="#000000" d="M16 1h2M15 2h1M18 2h2M14 3h1M20 3h2M13 4h1M22 4h2M12 5h1M24 5h2M11 6h1M26 6h1M10 7h1M26 7h1M9 8h1M25 8h1M8 9h1M24 9h1M7 10h1M24 10h1M6 11h1M24 11h1M6 12h1M25 12h1M5 13h1M25 13h1M5 14h1M26 14h1M4 15h1M26 15h1M4 16h1M27 16h1M3 17h1M27 17h1M3 18h1M28 18h1M3 19h3M28 19h1M5 20h1M27 20h1M5 21h1M18 21h1M27 21h1M4 22h1M17 22h2M26 22h1M4 23h1M17 23h1M19 23h1M26 23h1M3 24h1M16 24h1M19 24h1M25 24h1M3 25h1M16 25h1M20 25h1M25 25h1M3 26h3M15 26h1M20 26h1M24 26h1M6 27h2M15 27h1M21 27h1M24 27h1M8 28h2M14 28h1M21 28h3M10 29h2M14 29h1M12 30h3" />
          <path stroke="#3368dc" d="M16 2h2M15 3h5M14 4h8M13 5h11M12 6h1M15 6h11M11 7h2M17 7h9M10 8h2M19 8h6M9 9h3M21 9h3M8 10h3M7 11h4M7 12h3M6 13h3M6 14h3M5 15h3M5 16h3M10 16h1M4 17h3M12 17h1M4 18h3M14 18h1M16 19h1M18 20h1M19 22h1M20 24h1M21 26h1" />
          <path stroke="#3dabea" d="M13 6h2M13 7h4M12 8h7M12 9h9M11 10h12M11 11h12M10 12h12M23 12h2M10 13h12M23 13h2M9 14h12M22 14h4M9 15h12M22 15h4M8 16h2M11 16h9M21 16h6M8 17h4M13 17h7M21 17h6M7 18h7M15 18h4M20 18h8M7 19h9M17 19h2M20 19h8M6 20h11M19 20h8M6 21h11M19 21h8M5 22h11M20 22h6M5 23h11M20 23h6M4 24h11M21 24h4M4 25h11M21 25h4M6 26h8M22 26h2M8 27h6M22 27h2M10 28h3M12 29h1" />
          <path stroke="#5becf1" d="M23 10h1M23 11h1M22 12h1M22 13h1M21 14h1M21 15h1M20 16h1M20 17h1M19 18h1M19 19h1M17 20h1M17 21h1M16 22h1M16 23h1M15 24h1M15 25h1M14 26h1M14 27h1M13 28h1M13 29h1" />
          <path stroke="#222a5c" d="M9 13h1M8 15h1M7 17h1M6 19h1" />
        </svg>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">GitHub H-Index</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg">
          The user&apos;s <a href="https://en.wikipedia.org/wiki/H-index" className=" text-blue-500">h-index</a> is a productivity score based on how many of their repositories get a certain number of stars. If their h-index is 5, it means they have 5 projects that each got at least 5 stars.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto max-w-xs space-y-4">
          <div className="flex flex-row justify-items-end gap-2 w-full">
            <Input 
              id="username" 
              placeholder="Enter a username" 
              onChange={e => setUsername(e.target.value)}
            />
            <Button type="submit" className="">Go</Button>
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