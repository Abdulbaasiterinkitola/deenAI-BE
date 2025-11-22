import dataSource, { initializeDataSource } from '@database/data-source';
import { Plan, PlanInterval } from '@modules/plans/models/plan.model';
import { defaultPlans } from '@modules/plans/seeds/default-plans';

export const seedPlans = async () => {
  if (!dataSource.isInitialized) {
    await initializeDataSource();
  }

  const planRepository = dataSource.getRepository(Plan);

  for (const plan of defaultPlans) {
    const existing = await planRepository.findOne({
      where: { slug: plan.slug },
    });

    if (existing) {
      await planRepository.update(existing.id, plan);
    } else {
      const entity = planRepository.create({
        ...plan,
        interval: plan.interval || PlanInterval.MONTHLY,
      });
      await planRepository.save(entity);
    }
  }
};

// Allow running this seed standalone: `ts-node src/database/seeds/seed-plans.ts`
if (require.main === module) {
  seedPlans()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Plans seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Plans seeding failed', error);
      process.exit(1);
    });
}
