import 'reflect-metadata';

import { assert } from 'chai';

import * as ESTree from 'estree';

import { ServiceIdentifiers } from '../../../../src/container/ServiceIdentifiers';
import { InversifyContainerFacade } from '../../../../src/container/InversifyContainerFacade';

import { IInversifyContainerFacade } from '../../../../src/interfaces/container/IInversifyContainerFacade';
import { INodeTransformer } from '../../../../src/interfaces/node-transformers/INodeTransformer';

import { NodeTransformer } from '../../../../src/enums/node-transformers/NodeTransformer';
import { Nodes } from '../../../../src/node/Nodes';
import { NodeUtils } from '../../../../src/node/NodeUtils';

describe('ObfuscatingGuardsTransformer', () => {
    describe('transformNode (node: ESTree.Node, parentNode: ESTree.Node): ESTree.Node', () => {
        let inversifyContainerFacade: IInversifyContainerFacade,
            obfuscatingGuardsTransformer: INodeTransformer;

        before(() => {
            inversifyContainerFacade = new InversifyContainerFacade();
            inversifyContainerFacade.load('', {});

            obfuscatingGuardsTransformer = inversifyContainerFacade
                .getNamed(ServiceIdentifiers.INodeTransformer, NodeTransformer.ObfuscatingGuardsTransformer);
        });

        describe('variant #1: valid node', () => {
            const identifier: ESTree.Identifier = Nodes.getIdentifierNode('foo');

            const expectedResult: ESTree.Identifier = NodeUtils.clone(identifier);

            let result: ESTree.Identifier;

            before(() => {
                identifier.parentNode = identifier;

                expectedResult.ignoredNode = false;

                result = <ESTree.Identifier>obfuscatingGuardsTransformer.transformNode(identifier, identifier);
            });

            it('should add `ignoredNode` property with `false` value to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });

        describe('variant #2: invalid node', () => {
            const expressionStatement: ESTree.ExpressionStatement = Nodes.getExpressionStatementNode(
                Nodes.getIdentifierNode('foo')
            );

            const expectedResult: ESTree.ExpressionStatement = NodeUtils.clone(expressionStatement);

            let result: ESTree.ExpressionStatement;

            before(() => {
                expressionStatement.directive = 'use strict';
                expressionStatement.parentNode = expressionStatement;
                expressionStatement.expression.parentNode = expressionStatement;

                expectedResult.directive = 'use strict';
                expectedResult.parentNode = expectedResult;
                expectedResult.ignoredNode = true;

                result = <ESTree.ExpressionStatement>obfuscatingGuardsTransformer
                    .transformNode(expressionStatement, expressionStatement);
            });

            it('should add `ignoredNode` property with `true` value to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });
    });
});
