/** @format */
/**
 * External dependencies
 */
import { isEmpty, get } from 'lodash';

/**
 * Internal dependencies
 */
import { isNewSite } from 'state/sites/selectors';
import {
	getAllCartItems,
	hasDomainMapping,
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	hasConciergeSession,
	hasEcommercePlan,
	getGoogleApps,
	hasGoogleApps,
} from 'lib/cart-values/cart-items';
import isEligibleForDotcomChecklist from './is-eligible-for-dotcom-checklist';
import { retrieveSignupDestination } from 'signup/utils';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForSignupDestination( state, siteId, cart ) {
	if ( ! isEmpty( getAllCartItems( cart ) ) ) {
		if (
			hasDomainMapping( cart ) ||
			hasDomainRegistration( cart ) ||
			hasTransferProduct( cart ) ||
			( ! hasPlan( cart ) && ! hasConciergeSession( cart ) ) ||
			hasEcommercePlan( cart )
		) {
			return false;
		}
	}

	if ( hasGoogleApps( cart ) ) {
		const domainReceiptId = get( getGoogleApps( cart ), '[0].extra.receipt_for_domain', 0 );

		if ( ! domainReceiptId ) {
			return false;
		}
	}

	const destination = retrieveSignupDestination();

	if ( destination && destination.includes( '/checklist/' ) ) {
		return isNewSite( state, siteId ) && isEligibleForDotcomChecklist( state, siteId );
	}

	return '/' === destination ? false : isNewSite( state, siteId );
}
