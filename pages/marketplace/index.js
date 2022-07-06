import { useEthPrice } from '@components/hooks/useEthPrice'
import { useAccount, useNetwork } from '@components/hooks/web3'
import { Button } from '@components/ui/common'
import { CourseCard, CourseList } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { OrderModal } from '@components/ui/orders'
import { EthRates, WalletBar } from '@components/ui/web3'
import { getAllCourses } from '@content/courses/fetcher'
import { useState } from 'react'

export default function Marketplace({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { account } = useAccount()
  const { network } = useNetwork()
  const { eth } = useEthPrice()

  return (
    <>
      <div className="py-4">
        <WalletBar
          address={account.data}
          network={{
            data: network.data,
            target: network.target,
            isSupported: network.isSupported,
            hasInitialResponse: network.hasInitialResponse,
          }}
        />
        <EthRates eth={eth.data} />
      </div>

      {selectedCourse && (
        <OrderModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
      <CourseList courses={courses}>
        {(course) => (
          <CourseCard
            key={course.id}
            course={course}
            Footer={() => (
              <div className="mt-4">
                <Button
                  onClick={() => setSelectedCourse(course)}
                  variant="lightPurple"
                >
                  Purchase
                </Button>
              </div>
            )}
          />
        )}
      </CourseList>
      {/* {selectedCourse && (
        <OrderModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )} */}
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

Marketplace.Layout = BaseLayout