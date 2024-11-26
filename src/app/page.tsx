"use client"

import dynamic from 'next/dynamic'

const CVBuilderWithNoSSR = dynamic(
  () => import('@/components/CVBuilder'),
  { ssr: false }
)

export default function Home() {
  return <CVBuilderWithNoSSR />
}