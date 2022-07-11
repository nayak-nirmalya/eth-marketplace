import { useAccount, useOwnedCourse } from '@components/hooks/web3'
import { Message, Modal } from '@components/ui/common'
import { CourseHero, Keypoint, Curriculum } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { getAllCourses } from '@content/courses/fetcher'

export default function Course({ course }) {
  const { account } = useAccount()
  const { ownedCourse } = useOwnedCourse(course, account.data)
  const courseState = ownedCourse.data?.state
  // const courseState = 'activated'

  const isLocked = courseState === 'purchased' || courseState === 'deactivated'

  return (
    <>
      <div className="py-4">
        <CourseHero
          hasOwner={!!ownedCourse.data}
          title={course.title}
          description={course.description}
          image={course.coverImage}
        />
      </div>
      <Keypoint points={course.wsl} />
      {courseState && (
        <div className="max-w-5xl mx-auto">
          {courseState === 'purchased' && (
            <Message>
              Course is purchased and waiting for activation. Process can take
              up to 24 hours.
              <i className="block font-normal">
                In case of any query, please contact info@email.com
              </i>
            </Message>
          )}
          {courseState === 'activated' && <Message>Happy Learning!</Message>}
          {courseState === 'deactivated' && (
            <Message type="danger">
              Course has been deactivated, due to the incorrect purchase data.
              Functionality to watch the course has been temporarily disabled.
              <i className="block font-normal">
                Please contact: info@email.com
              </i>
            </Message>
          )}
        </div>
      )}

      <Curriculum locked={isLocked} courseState={courseState} />
      <Modal />
    </>
  )
}

export function getStaticPaths() {
  const { data } = getAllCourses()

  return {
    paths: data.map((course) => ({
      params: {
        slug: course.slug,
      },
    })),
    fallback: false,
  }
}

export function getStaticProps({ params }) {
  const { data } = getAllCourses()

  const course = data.filter((course) => course.slug === params.slug)[0]

  return {
    props: {
      course,
    },
  }
}
// Course.Layout = BaseLayout if not wrapped with <BaseLayout></BaseLayout>
Course.Layout = BaseLayout
