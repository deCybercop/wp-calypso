/**
 * External dependencies
 */
import { has, isEmpty, keyBy, map } from 'lodash';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect } from '@wordpress/data';
import { parse as parseBlocks } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import '@wordpress/nux';

/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import { trackDismiss, trackSelection, trackView, initializeWithIdentity } from './utils/tracking';
import ensureAssets from './utils/ensure-assets';

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
		selectedTemplate: null,
		error: null,
	};

	constructor( props ) {
		super();
		this.state.isOpen = ! isEmpty( props.templates );
	}

	componentDidMount() {
		if ( this.state.isOpen ) {
			trackView( this.props.segment.id, this.props.vertical.id );
		}
	}

	selectTemplate = newTemplate => {
		trackSelection( this.props.segment.id, this.props.vertical.id, newTemplate );

		const { siteInformation } = this.props;
		const template = this.props.templates[ newTemplate ];
		this.props.saveTemplateChoice( template );

		// Skip inserting if there's nothing to insert.
		if ( ! has( template, 'content' ) ) {
			return;
		}

		const templateTitle = replacePlaceholders( template.title, siteInformation );

		this.setState( {
			error: null,
			isLoading: true,
			selectTemplateTitle: template,
		} );

		const blocks = parseBlocks( replacePlaceholders( template.content, siteInformation ) );
		ensureAssets( blocks )
			.then( blocksWithAssets => {
				this.props.insertTemplate( templateTitle, blocksWithAssets );
				setTimeout( () => this.setState( { isOpen: false } ), 300 );
			} )
			.catch( error => {
				this.setState( {
					isLoading: false,
					error,
				} );
			} );
	};

	closeModal = () => {
		this.setState( { isOpen: false } );
		trackDismiss( this.props.segment.id, this.props.vertical.id );
	};

	render() {
		if ( ! this.state.isOpen ) {
			return null;
		}

		return (
			<Modal
				title={ __( 'Select Page Template', 'full-site-editing' ) }
				onRequestClose={ this.closeModal }
				className="page-template-modal"
				overlayClassName="page-template-modal-screen-overlay"
			>
				<div className="page-template-modal__inner">
					<form className="page-template-modal__form">
						{ this.state.isLoading ? (
							<div className="page-template-modal__loading">Loading…</div>
						) : (
							<fieldset className="page-template-modal__list">
								<TemplateSelectorControl
									label={ __( 'Template', 'full-site-editing' ) }
									templates={ map( this.props.templates, template => ( {
										label: template.title,
										value: template.slug,
										preview: template.preview,
										previewAlt: template.description,
									} ) ) }
									onClick={ newTemplate => this.selectTemplate( newTemplate ) }
								/>
							</fieldset>
						) }
					</form>
				</div>
			</Modal>
		);
	}
}

const PageTemplatesPlugin = compose(
	withSelect( select => ( {
		getMeta: () => select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
		postContentBlock: select( 'core/editor' )
			.getBlocks()
			.find( block => block.name === 'a8c/post-content' ),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => {
		// Disable tips right away as the collide with the modal window.
		dispatch( 'core/nux' ).disableTips();

		const editorDispatcher = dispatch( 'core/editor' );
		return {
			saveTemplateChoice: template => {
				// Save selected template slug in meta.
				const currentMeta = ownProps.getMeta();
				editorDispatcher.editPost( {
					meta: {
						...currentMeta,
						_starter_page_template: template.slug,
					},
				} );
			},
			insertTemplate: ( title, blocks ) => {
				// Set post title.
				editorDispatcher.editPost( {
					title: title,
				} );

				// Insert blocks.
				const postContentBlock = ownProps.postContentBlock;
				editorDispatcher.insertBlocks(
					blocks,
					0,
					postContentBlock ? postContentBlock.clientId : '',
					false
				);
			},
		};
	} )
)( PageTemplateModal );

// Load config passed from backend.
const {
	siteInformation = {},
	templates = [],
	vertical,
	segment,
	tracksUserData,
} = window.starterPageTemplatesConfig;

if ( tracksUserData ) {
	initializeWithIdentity( tracksUserData );
}

registerPlugin( 'page-templates', {
	render: function() {
		return (
			<PageTemplatesPlugin
				templates={ keyBy( templates, 'slug' ) }
				vertical={ vertical }
				segment={ segment }
				siteInformation={ siteInformation }
			/>
		);
	},
} );
