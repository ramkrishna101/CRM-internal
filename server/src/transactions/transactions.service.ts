import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    website?: string,
    panel?: string,
    type?: string,
    userId?: string,
    branch?: string,
    status?: string,
    lastCallStartDate?: string,
    lastCallEndDate?: string,
    lastCallOutcome?: string,
    lastTransactionStartDate?: string,
    lastTransactionEndDate?: string,
    firstTransactionStartDate?: string,
    firstTransactionEndDate?: string,
    totalDepositAmountStart?: number,
    totalDepositAmountEnd?: number,
    gameInterest?: string,
  ) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin(
        'websites',
        'website_entity',
        'website_entity.url = transaction.website',
      )
      .leftJoin(
        'customers',
        'customer',
        'customer.website_id = website_entity.id AND customer.external_id = transaction.client',
      );

    if (startDate && endDate) {
      query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('transaction.date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('transaction.date <= :endDate', { endDate });
    }
    if (website) {
      query.andWhere('transaction.website ILIKE :website', {
        website: `%${website}%`,
      });
    }
    if (panel) {
      query.andWhere('transaction.panel ILIKE :panel', { panel: `%${panel}%` });
    }
    if (type) {
      query.andWhere('transaction.type ILIKE :type', { type });
    }

    if (userId) {
      query.andWhere('customer.externalId = :client', { client: userId });
    }

    if (branch) {
      query.andWhere('transaction.branch = :branch', { branch });
    }

    // Join interactions if needed for filtering
    if (lastCallStartDate || lastCallEndDate || lastCallOutcome) {
      query.leftJoin(
        'interactions',
        'interactions',
        'interactions.customer_id = customer.id',
      );
    }

    if (status) {
      query.andWhere(
        `CASE 
          WHEN LEAST(
            COALESCE(customer.lastDepositDate, '1900-01-01'::timestamp),
            COALESCE(customer.lastWithdrawalDate, '1900-01-01'::timestamp)
          ) >= NOW() - INTERVAL '3 days' THEN 'active'
          WHEN LEAST(
            COALESCE(customer.lastDepositDate, '1900-01-01'::timestamp),
            COALESCE(customer.lastWithdrawalDate, '1900-01-01'::timestamp)
          ) >= NOW() - INTERVAL '30 days' THEN 'inactive'
          ELSE 'sleeping'
        END = :status`,
        { status },
      );
    }

    if (firstTransactionStartDate && firstTransactionEndDate) {
      query.andWhere(
        `LEAST(
          COALESCE(customer.firstDepositDate, '9999-12-31'::timestamp),
          COALESCE(customer.firstWithdrawalDate, '9999-12-31'::timestamp)
        ) BETWEEN :firstTransactionStartDate AND :firstTransactionEndDate`,
        { firstTransactionStartDate, firstTransactionEndDate },
      );
    } else if (firstTransactionStartDate) {
      query.andWhere(
        `LEAST(
          COALESCE(customer.firstDepositDate, '9999-12-31'::timestamp),
          COALESCE(customer.firstWithdrawalDate, '9999-12-31'::timestamp)
        ) >= :firstTransactionStartDate`,
        { firstTransactionStartDate },
      );
    } else if (firstTransactionEndDate) {
      query.andWhere(
        `LEAST(
          COALESCE(customer.firstDepositDate, '9999-12-31'::timestamp),
          COALESCE(customer.firstWithdrawalDate, '9999-12-31'::timestamp)
        ) <= :firstTransactionEndDate`,
        { firstTransactionEndDate },
      );
    }

    if (lastTransactionStartDate && lastTransactionEndDate) {
      query.andWhere(
        `GREATEST(
          COALESCE(customer.lastDepositDate, '1900-01-01'::timestamp),
          COALESCE(customer.lastWithdrawalDate, '1900-01-01'::timestamp)
        ) BETWEEN :lastTransactionStartDate AND :lastTransactionEndDate`,
        { lastTransactionStartDate, lastTransactionEndDate },
      );
    } else if (lastTransactionStartDate) {
      query.andWhere(
        `GREATEST(
          COALESCE(customer.lastDepositDate, '1900-01-01'::timestamp),
          COALESCE(customer.lastWithdrawalDate, '1900-01-01'::timestamp)
        ) >= :lastTransactionStartDate`,
        { lastTransactionStartDate },
      );
    } else if (lastTransactionEndDate) {
      query.andWhere(
        `GREATEST(
          COALESCE(customer.lastDepositDate, '1900-01-01'::timestamp),
          COALESCE(customer.lastWithdrawalDate, '1900-01-01'::timestamp)
        ) <= :lastTransactionEndDate`,
        { lastTransactionEndDate },
      );
    }

    if (lastCallStartDate && lastCallEndDate) {
      query.andWhere(
        'interactions.createdAt BETWEEN :lastCallStartDate AND :lastCallEndDate',
        { lastCallStartDate, lastCallEndDate },
      );
    } else if (lastCallStartDate) {
      query.andWhere('interactions.createdAt >= :lastCallStartDate', {
        lastCallStartDate,
      });
    } else if (lastCallEndDate) {
      query.andWhere('interactions.createdAt <= :lastCallEndDate', {
        lastCallEndDate,
      });
    }

    if (lastCallOutcome) {
      query.andWhere('interactions.outcome = :lastCallOutcome', {
        lastCallOutcome,
      });
    }

    // if (totalDepositAmountStart || totalDepositAmountEnd) {
    //   // Build subquery to calculate total deposits per client
    //   let subqueryCondition = `transaction.client IN (
    //     SELECT t.client
    //     FROM transactions t
    //     WHERE t.type = 'DEPOSIT'
    //     GROUP BY t.client
    //     HAVING `;

    //   if (totalDepositAmountStart && totalDepositAmountEnd) {
    //     subqueryCondition += `SUM(t.amount) >= :totalDepositAmountStart AND SUM(t.amount) <= :totalDepositAmountEnd`;
    //     query.andWhere(subqueryCondition + ')', {
    //       totalDepositAmountStart,
    //       totalDepositAmountEnd,
    //     });
    //   } else if (totalDepositAmountStart) {
    //     subqueryCondition += `SUM(t.amount) >= :totalDepositAmountStart`;
    //     query.andWhere(subqueryCondition + ')', {
    //       totalDepositAmountStart,
    //     });
    //   } else if (totalDepositAmountEnd) {
    //     subqueryCondition += `SUM(t.amount) <= :totalDepositAmountEnd`;
    //     query.andWhere(subqueryCondition + ')', {
    //       totalDepositAmountEnd,
    //     });
    //   }
    // }

    if (totalDepositAmountStart || totalDepositAmountEnd) {
      const depositSubQuery = query
        .subQuery()
        .select('t.client')
        .from('transactions', 't')
        .where(`t.type = 'DEPOSIT'`)
        .groupBy('t.client');

      if (totalDepositAmountStart && totalDepositAmountEnd) {
        depositSubQuery.having(
          `SUM(ABS(t.amount)) >= :totalDepositAmountStart AND SUM(ABS(t.amount)) <= :totalDepositAmountEnd`,
        );
        query.setParameters({ totalDepositAmountStart, totalDepositAmountEnd });
      } else if (totalDepositAmountStart) {
        depositSubQuery.having(
          `SUM(ABS(t.amount)) >= :totalDepositAmountStart`,
        );
        query.setParameter('totalDepositAmountStart', totalDepositAmountStart);
      } else if (totalDepositAmountEnd) {
        depositSubQuery.having(`SUM(ABS(t.amount)) <= :totalDepositAmountEnd`);
        query.setParameter('totalDepositAmountEnd', totalDepositAmountEnd);
      }

      query.andWhere(`transaction.client IN ${depositSubQuery.getQuery()}`);
    }

    if (gameInterest) {
      query.andWhere('customer.gameInterest = :gameInterest', { gameInterest });
    }

    query.orderBy('transaction.date', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getOptions(website?: string) {
    const panelsQuery = this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('DISTINCT transaction.panel', 'panel')
      .orderBy('transaction.panel', 'ASC');

    if (website) {
      panelsQuery.where('transaction.website = :website', { website });
    }

    const panels = await panelsQuery.getRawMany();

    const websites = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('DISTINCT transaction.website', 'website')
      .orderBy('transaction.website', 'ASC')
      .getRawMany();

    return {
      panels: panels.map((p) => p.panel).filter(Boolean),
      websites: websites.map((w) => w.website).filter(Boolean),
    };
  }

  async getUniqueClients(
    page: number = 1,
    limit: number = 10,
    search?: string,
    website?: string,
    panel?: string, // panel parameter filters by transaction.panel column
    status?: string,
    lastDepositDate?: string,
    userWebsite?: string, // User's assigned website (for restriction)
    userPanels?: string[], // User's assigned panels (for restriction)
  ) {
    // Base query builder function to ensure consistency between count and data queries
    const createBaseQuery = () => {
      const qb = this.transactionsRepository
        .createQueryBuilder('transaction')
        .leftJoin(
          'websites',
          'website_entity',
          'website_entity.url = transaction.website',
        )
        .leftJoin(
          'customers',
          'customer',
          'customer.website_id = website_entity.id AND customer.external_id = transaction.client',
        );
      if (search) {
        qb.andWhere(
          '(customer.externalId ILIKE :search OR transaction.branch ILIKE :search OR transaction.website ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Apply user's website restriction if provided
      const effectiveWebsite = website || userWebsite;
      if (effectiveWebsite) {
        qb.andWhere('LOWER(transaction.website) = LOWER(:website)', {
          website: effectiveWebsite.trim(),
        });
      }

      // Apply user's panel restrictions if provided
      if (userPanels && userPanels.length > 0) {
        // If user has panel restrictions, filter by those panels
        // If a specific panel filter is provided, it must be in user's panels
        if (panel) {
          if (userPanels.some((p) => p.toLowerCase() === panel.toLowerCase())) {
            qb.andWhere('LOWER(transaction.panel) = LOWER(:panel)', {
              panel: panel.trim(),
            });
          } else {
            // User doesn't have access to this panel, return empty result
            qb.andWhere('1 = 0'); // Always false condition
          }
        } else {
          // Filter by user's allowed panels
          qb.andWhere('LOWER(transaction.panel) IN (:...panels)', {
            panels: userPanels.map((p) => p.toLowerCase()),
          });
        }
      } else if (panel) {
        // No user panel restrictions, apply panel filter normally
        qb.andWhere('LOWER(transaction.panel) = LOWER(:panel)', {
          panel: panel.trim(),
        });
      }
      return qb;
    };

    // Get total count of unique clients
    const countQuery = createBaseQuery().select(
      'COUNT(DISTINCT customer.externalId)',
      'count',
    );

    const countResult = await countQuery.getRawOne();
    const total = parseInt(countResult?.count || '0', 10);

    // Get paginated results
    const query = createBaseQuery()
      .select('customer.externalId', 'client')
      .addSelect('MIN(transaction.branch)', 'branch')
      .addSelect('MIN(transaction.panel)', 'panel')
      .addSelect('MIN(transaction.website)', 'website')
      .addSelect('COUNT(*)', 'transactionCount')
      .addSelect(
        "SUM(CASE WHEN transaction.type = 'DEPOSIT' THEN transaction.amount ELSE 0 END)",
        'totalDeposits',
      )
      .addSelect(
        "SUM(CASE WHEN transaction.type = 'WITHDRAW' THEN transaction.amount ELSE 0 END)",
        'totalWithdrawals',
      )
      .addSelect(
        "MAX(CASE WHEN transaction.type = 'DEPOSIT' THEN transaction.date END)::timestamp",
        'lastDepositDate',
      )
      .groupBy('customer.externalId');

    if (lastDepositDate) {
      query.having(
        "MAX(CASE WHEN transaction.type = 'DEPOSIT' THEN transaction.date END)::date = :lastDepositDate",
        { lastDepositDate },
      );
    }

    query
      .orderBy('customer.externalId', 'ASC')
      .offset((page - 1) * limit)
      .limit(limit);

    const results = await query.getRawMany();

    const items = results.map((r) => ({
      client: r.client,
      branch: r.branch || 'N/A',
      panel: r.panel || 'N/A',
      website: r.website || 'N/A',
      status: 'Active', // Default status
      transactionCount: parseInt(r.transactionCount || r.transactioncount),
      totalDeposits: parseFloat(r.totalDeposits || r.totaldeposits) || 0,
      totalWithdrawals:
        parseFloat(r.totalWithdrawals || r.totalwithdrawals) || 0,
      lastDepositDate:
        r.lastDepositDate || r.lastdepositdate || r.last_deposit_date || null,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClientTransactions(client: string) {
    // Since we can't use the decorator relationship, use query builder with proper joins
    const deposits = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.client = :client', { client })
      .andWhere('transaction.type = :type', { type: 'DEPOSIT' })
      .orderBy('transaction.date', 'DESC')
      .getMany();

    const withdrawals = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.client = :client', { client })
      .andWhere('transaction.type = :type', { type: 'WITHDRAW' })
      .orderBy('transaction.date', 'DESC')
      .getMany();

    // Get branch and website from the most recent transaction
    const lastTransaction = deposits[0] || withdrawals[0];
    const branch = lastTransaction ? lastTransaction.branch : 'N/A';
    const website = lastTransaction ? lastTransaction.website : 'N/A';

    return {
      client,
      branch,
      website,
      deposits,
      withdrawals,
      summary: {
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
        lastDepositDate: deposits.length > 0 ? deposits[0].date : null,
      },
    };
  }
}
