import { InMemoryRepository } from '../../src/data';
import { runRepositoryContract } from '../../src/testing/repositoryContract';

runRepositoryContract('InMemoryRepository', () => new InMemoryRepository());
