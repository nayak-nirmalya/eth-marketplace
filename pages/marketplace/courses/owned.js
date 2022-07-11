import { useAccount, useOwnedCourses } from '@components/hooks/web3'
import { useWeb3 } from '@components/provider'
import { Button, Message } from '@components/ui/common'
import { OwnedCourseCard } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import { getAllCourses } from '@content/courses/fetcher'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function OwnedCourses({ courses }) {
  const router = useRouter()
  const { account } = useAccount()
  const { requireInstall } = useWeb3()
  const { ownedCourses } = useOwnedCourses(courses, account.data)

  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        {ownedCourses.isEmpty && (
          <div className="w-1/2">
            <Message type="danger">
              <div>You don't won any courses!</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase Course!</i>
                </a>
              </Link>
            </Message>
          </div>
        )}
        {account.isEmpty && (
          <div className="w-1/2">
            <Message type="danger">
              <div>Please, connect to Metamask!</div>
            </Message>
          </div>
        )}
        {requireInstall && (
          <div className="w-1/2">
            <Message type="danger">
              <div>Please install Metamask</div>
            </Message>
          </div>
        )}
        {ownedCourses.data?.map((course) => (
          <OwnedCourseCard key={course.id} course={course}>
            <Button onClick={() => router.push(`/courses/${course.slug}`)}>
              Watch the Course
            </Button>
          </OwnedCourseCard>
        ))}
      </section>
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllCourses()
  return {
    props: {
      courses: data,
    },
  }
}

OwnedCourses.Layout = BaseLayout
