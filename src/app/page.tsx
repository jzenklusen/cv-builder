// "use client"

// import CVBuilder from "@/components/CVBuilder";

// export default function Home() {
//   return <CVBuilder />;
// }


"use client"

import dynamic from 'next/dynamic'
import CVBuilder from "@/components/CVBuilder"

const CVBuilderWithNoSSR = dynamic(
  () => import('@/components/CVBuilder'),
  { ssr: false }
)

export default function Home() {
  return <CVBuilderWithNoSSR />
}