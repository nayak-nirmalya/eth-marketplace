import { useOwnedCourses, useWalletInfo } from '@components/hooks/web3'
import { useWeb3 } from '@components/provider'
import { Button, Loader } from '@components/ui/common'
import { CourseCard, CourseList } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import { OrderModal } from '@components/ui/orders'
import { getAllCourses } from '@content/courses/fetcher'
import { useState } from 'react'

export default function Marketplace({ courses }) {
  const { web3, contract, requireInstall } = useWeb3()
  const { hasConnectedWallet, isConnecting, account } = useWalletInfo()
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { ownedCourses } = useOwnedCourses(courses, account.data)

  const purchaseCourse = async (order) => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id)
    const orderHash = web3.utils.soliditySha3(
      { type: 'bytes16', value: hexCourseId },
      { type: 'address', value: account.data },
    )
    const emailHash = web3.utils.sha3(order.email)
    const proof = web3.utils.soliditySha3(
      { type: 'bytes32', value: emailHash },
      { type: 'bytes32', value: orderHash },
    )
    const value = web3.utils.toWei(String(order.price))

    try {
      const result = await contract.methods
        .purchaseCourse(hexCourseId, proof)
        .send({ from: account.data, value })
      console.log(result)
    } catch (error) {
      console.error('Purchase Course: Operation has failed!')
    }
  }

  return (
    <>
      <MarketHeader />

      {selectedCourse && (
        <OrderModal
          course={selectedCourse}
          onSubmit={purchaseCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
      <CourseList courses={courses}>
        {(course) => (
          <CourseCard
            key={course.id}
            course={course}
            disabled={!hasConnectedWallet}
            Footer={() => {
              if (requireInstall) {
                return (
                  <Button disabled={true} variant="lightPurple">
                    Install
                  </Button>
                )
              }

              if (isConnecting) {
                return (
                  <Button disabled={true} variant="lightPurple">
                    <Loader size="sm" />
                  </Button>
                )
              }

              if (!ownedCourses.hasInitialResponse) {
                return (
                  <div style={{ height: '50px' }}></div>
                  // <Button disabled={true} variant="lightPurple">
                  //   Loading State...
                  // </Button>
                )
              }

              const owned = ownedCourses.lookup[course.id]

              if (owned) {
                return (
                  <Button disabled={true} variant="green">
                    Owned
                  </Button>
                )
              }

              return (
                <Button
                  onClick={() => setSelectedCourse(course)}
                  disabled={!hasConnectedWallet}
                  variant="lightPurple"
                >
                  Purchase
                </Button>
              )
            }}
          />
        )}
      </CourseList>
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
