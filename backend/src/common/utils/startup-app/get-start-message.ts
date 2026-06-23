import { getBorderCharacters, table } from 'table';
import { readPackageJSON } from 'pkg-types';
import gradient from 'gradient-string';
import chalk from 'chalk';

export async function getStartMessage() {
    const pkg = await readPackageJSON();

    const gradientRange = gradient(['#7c5cff', '#a288f1', '#22d3ee']);

    return table(
        [
            [gradientRange('▰▱'.repeat(30))],
            [gradientRange(`👻 Ghost Sphere · Engine v${pkg.version}`)],
            [chalk.dim('by Ghost OS')],
            [chalk.gray('─'.repeat(60))],
            [
                chalk.cyan('📚 Documentation') +
                    chalk.gray(' ········ ') +
                    chalk.white('https://github.com/SKINOREZZZ101/SPHEREGHOST'),
            ],
            [
                chalk.green('💬 Community') +
                    chalk.gray(' ······ ') +
                    chalk.white('Ghost OS'),
            ],
            [chalk.gray('─'.repeat(60))],
            [
                chalk.yellow('🛠️  Rescue CLI') +
                    chalk.gray(' ······ ') +
                    chalk.dim('docker exec -it ghost-sphere-backend gs'),
            ],
            [gradientRange('▰▱'.repeat(30))],
        ],
        {
            columnDefault: {
                width: 64,
            },
            columns: {
                0: { alignment: 'center' },
            },
            drawVerticalLine: () => false,
            drawHorizontalLine: () => false,
            border: getBorderCharacters('honeywell'),
        },
    );
}
