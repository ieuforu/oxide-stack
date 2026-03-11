'use client'

// import type { InferResponseType } from '@repo/server'

import { Button, Card, CardTitle, Input, Separator, Skeleton, toast } from '@repo/ui'

import { trpc } from '@/lib/trpc'
import React, { useTransition } from 'react'
// import type { client } from '../lib/api'

// type UsersResponse = InferResponseType<typeof client.users.$get>

type User = { id: number; fullName: string | null; age: number | null }
type OptimisticUser = User & { isPending?: boolean }

export default function Home() {
  const utils = trpc.useUtils()
  const [newUserName, setNewUserName] = React.useState('')
  const [, startTransition] = useTransition()

  const usersQuery = trpc.user.list.useQuery()
  const projects = trpc.project.list.useQuery()

  const loading = usersQuery.isFetching || projects.isFetching

  const [optimisticUsers, addOptimisticUser] = React.useOptimistic<OptimisticUser[], User>(
    usersQuery.data ?? [],
    (state, newUser) => [{ ...newUser, isPending: true }, ...state],
  )

  const handleRequest = () => {
    startTransition(() => {
      usersQuery.refetch()
    })
  }

  const createMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast.success('添加成功')
      setNewUserName('')
      utils.user.list.invalidate()
    },
    onError: (error) => {
      toast.error(`提交失败: ${error.message}`)
    },
  })

  // const handlePostRequest = () => {
  //   if (!newUserName) return toast.error('请输入内容')
  //   createMutation.mutate({ fullName: newUserName, age: 18 })
  // }

  const handlePostRequest = async () => {
    if (!newUserName) return toast.error('请输入内容')

    const payload = { fullName: newUserName, age: 18 }
    const tempId = Date.now()

    startTransition(async () => {
      addOptimisticUser({ id: tempId, ...payload })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        if (Math.random() > 0.5) {
          throw new Error('SERVER_BUSY: DATABASE_TIMEOUT')
        }

        await createMutation.mutateAsync(payload)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '提交失败')
      }
    })
  }
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 px-6 py-12 text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">
              Terminal <span className="text-zinc-400">Data</span>
            </h1>
            <p className="font-mono text-sm text-zinc-500 uppercase tracking-widest">
              Monorepo / Shadcn / Tailwind v4
            </p>
          </div>
          <Button
            onClick={handleRequest}
            disabled={loading}
            className="h-14 px-10 rounded-none border-2 border-zinc-900 bg-zinc-900 font-bold uppercase tracking-tighter hover:bg-white hover:text-zinc-900 transition-all dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {loading ? 'FETCHING...' : 'SYNC DATABASE'}
          </Button>
        </header>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 bg-blue-600 animate-pulse" />
            <h2 className="font-mono text-sm font-black uppercase tracking-[0.2em]">
              Live_Projects_Feed (via tRPC)
            </h2>
          </div>

          {projects.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-none bg-zinc-100 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.data?.map((project) => (
                <div
                  key={project.id}
                  className="group relative border-2 border-zinc-900 p-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:border-zinc-50 dark:hover:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-zinc-400">
                      ID_{project.id.toString().padStart(3, '0')}
                    </span>
                    <span className="bg-blue-600 px-1.5 py-0.5 font-mono text-[10px] text-white font-bold">
                      {project.stars}★
                    </span>
                  </div>
                  <h3 className="text-lg font-bold truncate uppercase tracking-tighter">
                    {project.name}
                  </h3>
                  <div className="mt-4 h-1 w-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-1000"
                      style={{ width: `${Math.min(project.stars / 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mb-12 flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute -top-2.5 left-3 bg-white px-2 font-mono text-[10px] font-bold text-zinc-400 uppercase dark:bg-zinc-950">
              Command_Input
            </span>
            <Input
              placeholder="ENTER_NEW_USER_NAME..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="h-14 rounded-none border-2 border-zinc-900 bg-transparent font-mono focus-visible:ring-0 dark:border-zinc-50"
            />
          </div>
          <Button
            onClick={handlePostRequest}
            className="h-14 px-8 rounded-none border-2 border-zinc-900 bg-zinc-900 font-bold dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            EXECUTE_POST
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-none bg-zinc-100" />
            ))}
          </div>
        ) : optimisticUsers && optimisticUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-800">
            {optimisticUsers.map((user) => {
              const isOptimistic = 'isPending' in user && user.isPending
              return (
                <Card
                  key={user.id}
                  className={`
                    rounded-none border-none p-6 transition-all
                    ${
                      isOptimistic
                        ? 'bg-zinc-100 opacity-60 dark:bg-zinc-900 border-2 border-dashed border-zinc-400'
                        : 'bg-white dark:bg-zinc-950'
                    }
                  `}
                >
                  {isOptimistic && (
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-zinc-200/10 to-transparent animate-shimmer" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-tight">
                        Entry #{user.id.toString().padStart(3, '0')}
                      </p>
                      <CardTitle className="text-2xl font-bold tracking-tighter">
                        {user.fullName}
                      </CardTitle>
                    </div>
                    <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                      <span className="text-white dark:text-zinc-900 font-bold text-xs">
                        {user.fullName?.charAt(0) ?? '?'}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4 bg-zinc-100 dark:bg-zinc-800" />

                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex flex-col">
                      <span className="text-zinc-400 uppercase">Metric Value</span>
                      <span className={(user.age ?? 0) > 0 ? 'text-blue-600' : 'text-red-600'}>
                        {user.age?.toLocaleString() ?? 'N/A'}
                      </span>
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-bold uppercase text-[10px] tracking-widest"
                    >
                      Details →
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="border-4 border-double border-zinc-200 p-20 text-center dark:border-zinc-800">
            <p className="font-mono text-zinc-400 animate-pulse">SYSTEM_IDLE: AWAITING_COMMAND</p>
          </div>
        )}
      </div>
    </main>
  )
}
