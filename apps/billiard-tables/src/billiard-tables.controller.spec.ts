import { Test, TestingModule } from '@nestjs/testing';

import { BilliardTablesController } from './billiard-tables.controller';
import { BilliardTablesService } from './billiard-tables.service';

describe('BilliardTablesController', () => {
  let billiardTablesController: BilliardTablesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BilliardTablesController],
      providers: [BilliardTablesService],
    }).compile();

    billiardTablesController = app.get<BilliardTablesController>(
      BilliardTablesController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(billiardTablesController).toBe('Hello World!');
    });
  });
});
