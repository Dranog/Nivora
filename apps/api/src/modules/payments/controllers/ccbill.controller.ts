import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CCBillService } from '../services/ccbill.service';
import { PaymentsService } from '../payments.service';
import { PostsService } from '../../posts/posts.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('payments/ccbill')
export class CCBillController {
  constructor(
    private readonly ccbillService: CCBillService,
    private readonly paymentsService: PaymentsService,
    private readonly postsService: PostsService,
  ) {}

  /**
   * Créer checkout pour TIP
   */
  @Post('create-tip-checkout')
  @UseGuards(JwtAuthGuard)
  async createTipCheckout(@Body() body: any, @Req() req: any) {
    const { creatorId, amount, message } = body;
    const userId = req.user.id;

    // Générer URL CCBill
    const url = this.ccbillService.generatePaymentUrl({
      amount,
      currency: 'EUR',
      userId,
      type: 'tip',
      metadata: {
        creatorId,
        message: message || '',
      },
    });

    return { url };
  }

  /**
   * Créer checkout pour UNLOCK
   */
  @Post('create-unlock-checkout')
  @UseGuards(JwtAuthGuard)
  async createUnlockCheckout(@Body() body: any, @Req() req: any) {
    const { postId } = body;
    const userId = req.user.id;

    const post = await this.postsService.findOne(postId);

    const url = this.ccbillService.generatePaymentUrl({
      amount: post.unlockPrice || 10,
      currency: 'EUR',
      userId,
      type: 'unlock',
      metadata: {
        postId,
        creatorId: post.creatorId,
      },
    });

    return { url };
  }

  /**
   * Postback CCBill (webhook)
   * URL : https://votre-api.com/api/payments/ccbill/postback
   */
  @Post('postback')
  async handlePostback(@Body() body: any, @Res() res: any) {
    // Vérifier signature CCBill
    const isValid = this.ccbillService.verifyPostback(body);

    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }

    const {
      subscription_id,
      transactionId,
      userId,
      transactionType,
      accountingAmount,
      metadata_creatorId,
      metadata_message,
      metadata_postId,
    } = body;

    // Tip
    if (transactionType === 'tip') {
      await this.paymentsService.processTip({
        userId,
        creatorId: metadata_creatorId,
        amount: parseFloat(accountingAmount),
        message: metadata_message,
        ccbillSubscriptionId: subscription_id,
      });
    }

    // Unlock
    if (transactionType === 'unlock') {
      await this.paymentsService.processUnlock({
        userId,
        postId: metadata_postId,
        amount: parseFloat(accountingAmount),
        ccbillSubscriptionId: subscription_id,
      });
    }

    res.status(200).send('OK');
  }

  /**
   * Success redirect (après paiement CCBill)
   * URL : https://votre-site.com/payment/success
   */
  @Get('success')
  async handleSuccess(@Query() query: any, @Res() res: any) {
    const { subscription_id } = query;

    // Vérifier transaction
    const transaction = await this.paymentsService.findBySubscriptionId(subscription_id);

    if (!transaction) {
      return res.redirect('/payment/error');
    }

    res.redirect('/payment/success');
  }
}
