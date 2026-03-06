/**
 * KarigarSetu Cloud Functions — Entry Point
 *
 * Two HTTP-triggered functions:
 * 1. productPipeline — AI analysis of craft images (listing, heritage, provenance)
 * 2. orderNotification — Push notifications to artisans for new orders
 */

export { productPipeline } from './productPipeline';
export { orderNotification } from './orderNotification';
