import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prismaClientToSeed = new PrismaClient()

async function seed() {
  await prismaClientToSeed.project.deleteMany()

  await prismaClientToSeed.member.deleteMany()

  await prismaClientToSeed.organization.deleteMany()

  await prismaClientToSeed.user.deleteMany()

  const passwordHash = await hash('123456', 1)

  const user = await prismaClientToSeed.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@sample.com',
      avatarUrl: 'https://github.com/lucasnbat.png',
      passwordHash,
    },
  })

  const anotherUser = await prismaClientToSeed.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  const anotherUser2 = await prismaClientToSeed.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  await prismaClientToSeed.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id, // user = John Doe
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'ADMIN' },
            { userId: anotherUser.id, role: 'MEMBER' },
            { userId: anotherUser2.id, role: 'MEMBER' },
          ],
        },
      },
    },
  })

  await prismaClientToSeed.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id, // user = John Doe
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'MEMBER' },
            { userId: anotherUser.id, role: 'ADMIN' },
            { userId: anotherUser2.id, role: 'MEMBER' },
          ],
        },
      },
    },
  })

  await prismaClientToSeed.organization.create({
    data: {
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id, // user = John Doe
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.words(5),
              description: faker.lorem.paragraph(5),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'BILLING' },
            { userId: anotherUser.id, role: 'ADMIN' },
            { userId: anotherUser2.id, role: 'MEMBER' },
          ],
        },
      },
    },
  })
}
seed()
