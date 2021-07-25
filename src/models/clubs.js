import prisma from '../modules/prisma';

export const getClub = (uuid) => prisma.clubs.findUnique({ where: { uuid } });

export const getClubBySlug = (slug) => prisma.clubs.findUnique({ where: { slug } });

export const allClubs = () => prisma.clubs.findMany({});

export const create = async (data) => {
  await prisma.clubs.create({ data });
};
