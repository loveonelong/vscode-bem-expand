import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

import * as vscode from 'vscode';

import { findClass, checkTree } from '../src/find-class';
import * as bemExpand from '../src/extension';

suite('Extension Tests', () => {
    test('findClass', () => {
        assert.equal(findClass(`  <div class="l-foo l-foo--special">`), 'l-foo');
    });

    test('checkTree', () => {
        assert.equal(checkTree(`  <div class="l-foo l-foo--special">`, []), true);
    });
    test('checkTreeFalse', () => {
        assert.equal(checkTree(` </div>`, []), false);
    });

    test('bemExpand', () => {
        let testFilePath = path.join(os.tmpdir(), 'bem-expand-' + (Math.random() * 100000) + '.html');

        fs.writeFileSync(testFilePath, `<div class="l-foo l-foo--special">\n  .&__bar\n</div>`);

        return vscode.workspace.openTextDocument(testFilePath).then((document) => {
            return vscode.window.showTextDocument(document).then((editor) => {
                let position = new vscode.Position(1, 9);

                editor.selection = new vscode.Selection(position, position);

                return vscode.commands.executeCommand('extension.bemExpand').then(() => {
                    assert.equal(editor.document.lineAt(1).text, `  <div class="l-foo__bar"></div>`);
                });
            });
        });
    });
    test('bemExpandMultiline', () => {
        let testFilePath = path.join(os.tmpdir(), 'bem-expand-' + (Math.random() * 100000) + '.html');

        fs.writeFileSync(testFilePath, `<div class="l-foo l-foo--special">\n  .&__bar\n</div>`);
        fs.writeFileSync(testFilePath, `<div class="r-foo">\n    <div class="r-foo__bar"></div>\n` +
            `    <div class="r-foo__bar">\n        .&--bar\n    </div>\n</div>`);

        return vscode.workspace.openTextDocument(testFilePath).then((document) => {
            return vscode.window.showTextDocument(document).then((editor) => {
                let position = new vscode.Position(3, 15);

                editor.selection = new vscode.Selection(position, position);

                return vscode.commands.executeCommand('extension.bemExpand').then(() => {
                    assert.equal(editor.document.lineAt(3).text, `        <div class="r-foo__bar--bar"></div>`);
                });
            });
        });
    });
});
