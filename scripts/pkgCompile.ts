// @ts-ignore
import ncc from '@vercel/ncc';
import { Package } from 'dts-packer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as resolve from 'resolve';

export interface BuildOption {
  extraDtsOnly?: boolean;
  dep?: string;
  clean?: boolean;
}

export interface CompiledConfig {
  deps?: string[];
  externals?: Record<string, string>;
  noMinify?: string[];
  excludeDtsDeps?: string[];
  extraDtsDeps?: string[];
  extraDtsExternals?: string[];
}

async function buildDeps(opts: any) {
  const nodeModulesPath = path.join(opts.base, 'node_modules');
  const target = path.join(opts.base, opts.target);

  if (isSameVersion(target, opts) && !opts.clean) return;
  fs.removeSync(target);

  console.log(`Build dep ${opts.pkgName || opts.file}`);

  let entry;
  if (opts.pkgName) {
    let resolvePath = opts.pkgName;
    // mini-css-extract-plugin 用 dist/cjs 为入口会有问题
    if (opts.pkgName === 'mini-css-extract-plugin') {
      resolvePath = 'mini-css-extract-plugin/dist/index';
    }
    entry = require.resolve(resolvePath, {
      paths: [nodeModulesPath],
    });
  } else {
    entry = path.join(opts.base, opts.file);
  }

  if (!opts.dtsOnly) {
    if (opts.isDependency) {
      fs.ensureDirSync(target);
      fs.writeFileSync(
        path.join(target, 'index.js'),
        `
const exported = require("${opts.pkgName}");
Object.keys(exported).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === exported[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return exported[key];
    }
  });
});
      `.trim() + '\n',
        'utf-8',
      );
    } else {
      const filesToCopy: string[] = [];
      let { code, assets } = await ncc(entry, {
        externals: opts.webpackExternals,
        minify: !!opts.minify,
        target: 'es5',
        esm: false,
        assetBuilds: false,
      });

      // assets
      if (filesToCopy.length) console.log('filesToCopy', filesToCopy);
      for (const key of Object.keys(assets)) {
        const asset = assets[key];
        const data = asset.source;
        const filePath = path.join(target, key);
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(path.join(target, key), data);
      }

      // filesToCopy
      for (const fileToCopy of filesToCopy) {
        let content = fs.readFileSync(fileToCopy, 'utf-8');
        for (const key of Object.keys(opts.webpackExternals)) {
          content = content
            .replace(
              new RegExp(`require\\\(['"]${key}['"]\\\)`, 'gm'),
              `require('${opts.webpackExternals[key]}')`,
            )
            .replace(
              new RegExp(
                `require\\\(['"]${key}/package(\.json)?['"]\\\)`,
                'gm',
              ),
              `require('${opts.webpackExternals[key]}/package.json')`,
            );
        }
        fs.writeFileSync(
          path.join(target, path.basename(fileToCopy)),
          content,
          'utf-8',
        );
      }

      // entry code
      fs.ensureDirSync(target);
      // node 14 support for chalk
      if (['chalk', 'pkg-up', 'execa', 'globby'].includes(opts.pkgName)) {
        code = code.replace(/require\("node:/g, 'require("');
      }
      fs.writeFileSync(path.join(target, 'index.js'), code, 'utf-8');

      // patch
      if (opts.pkgName === 'mini-css-extract-plugin') {
        fs.copySync(
          path.join(nodeModulesPath, opts.pkgName, 'dist', 'hmr'),
          path.join(target, 'hmr'),
        );
        fs.copyFileSync(
          path.join(nodeModulesPath, opts.pkgName, 'dist', 'utils.js'),
          path.join(target, 'utils.js'),
        );
        fs.copyFileSync(
          path.join(
            nodeModulesPath,
            opts.pkgName,
            'dist',
            'loader-options.json',
          ),
          path.join(target, 'loader-options.json'),
        );
      }
      if (opts.pkgName === 'fork-ts-checker-webpack-plugin') {
        fs.removeSync(path.join(target, 'typescript.js'));
      }
    }
  }

  // license & package.json
  if (opts.pkgName) {
    if (opts.isDependency) {
      fs.ensureDirSync(target);
      fs.writeFileSync(
        path.join(target, 'index.d.ts'),
        `export * from '${opts.pkgName}';\n`,
        'utf-8',
      );
    } else {
      fs.ensureDirSync(target);
      const pkgRoot = path.dirname(
        resolve.sync(`${opts.pkgName}/package.json`, {
          basedir: opts.base,
        }),
      );
      if (fs.existsSync(path.join(pkgRoot, 'LICENSE'))) {
        fs.writeFileSync(
          path.join(target, 'LICENSE'),
          fs.readFileSync(path.join(pkgRoot, 'LICENSE'), 'utf-8'),
          'utf-8',
        );
      }
      const { name, author, license, types, typing, typings, version } =
        fs.readJSONSync(path.join(pkgRoot, 'package.json'), 'utf-8');
      fs.writeJSONSync(path.join(target, 'package.json'), {
        ...{ name, version },
        ...{ version },
        ...(author ? { author } : undefined),
        ...(license ? { license } : undefined),
        ...(types ? { types } : undefined),
        ...(typing ? { typing } : undefined),
        ...(typings ? { typings } : undefined),
      });

      // dts
      if (opts.noDts) {
        console.log(`Do not build dts for ${opts.pkgName}`);
      } else {
        try {
          new Package({
            cwd: opts.base,
            name: opts.pkgName,
            typesRoot: target,
            externals: opts.dtsExternals,
          });
        } catch (e) {
          //
        }

        if (opts.pkgName === 'lodash') {
          // TODO
          // fs.copySync()
        }
      }
    }
  }

  // copy files in packages
  if (opts.file && !opts.dtsOnly) {
    const packagesDir = path.join(
      opts.base,
      path.dirname(opts.file),
      'packages',
    );
    if (fs.existsSync(packagesDir)) {
      const files = fs.readdirSync(packagesDir);
      files.forEach((file) => {
        if (file.charAt(0) === '.') return;
        if (!fs.statSync(path.join(packagesDir, file)).isFile()) return;
        fs.copyFileSync(path.join(packagesDir, file), path.join(target, file));
      });
    }
  }
}

function isSameVersion(target: string, opts: any) {
  const pkgInfo = fs.existsSync(`${target}/package.json`)
    ? fs.readJSONSync(`${target}/package.json`)
    : null;

  if (pkgInfo) {
    const pkgRoot = path.dirname(
      resolve.sync(`${opts.pkgName}/package.json`, {
        basedir: opts.base,
      }),
    );
    const lastPkgInfo = fs.readJSONSync(
      path.join(pkgRoot, 'package.json'),
      'utf-8',
    );
    if (lastPkgInfo.version === pkgInfo.version) {
      return true;
    } else {
      console.info(
        `${opts.pkgName}: ${pkgInfo.version} -> ${lastPkgInfo.version}`,
      );
    }
  }
  return false;
}

async function main() {
  const opts: BuildOption = {};
  const base = process.cwd();
  const pkg = fs.readJSONSync(path.join(base, 'package.json'));
  const pkgDeps = pkg.dependencies || {};
  const compiledConfigPath = path.join(base, 'compiled.json');
  const compiledConfig: CompiledConfig | null = fs.existsSync(
    compiledConfigPath,
  )
    ? fs.readJSONSync(path.join(base, 'compiled.json'))
    : null;
  if (!compiledConfig?.deps) return;
  const {
    deps,
    externals = {},
    noMinify = [],
    extraDtsDeps = [],
    extraDtsExternals = [],
    excludeDtsDeps = [],
  } = compiledConfig;

  const webpackExternals: Record<string, string> = {};
  const dtsExternals = [...extraDtsDeps, ...extraDtsExternals];
  Object.keys(externals).forEach((name) => {
    const val = externals[name];
    if (val === '$$LOCAL') {
      dtsExternals.push(name);
      webpackExternals[name] = `${pkg.name}/compiled/${name}`;
    } else {
      webpackExternals[name] = val;
    }
  });

  for (const dep of opts.dep
    ? [opts.dep]
    : opts.extraDtsOnly
    ? extraDtsDeps
    : deps.concat(extraDtsDeps)) {
    const isDep = dep.charAt(0) !== '.';
    await buildDeps({
      ...(isDep ? { pkgName: dep } : { file: dep }),
      target: `compiled/${isDep ? dep : path.basename(path.dirname(dep))}`,
      base,
      webpackExternals,
      dtsExternals,
      clean: opts.clean,
      minify: !noMinify.includes(dep),
      dtsOnly: extraDtsDeps.includes(dep),
      noDts: excludeDtsDeps.includes(dep),
      isDependency: dep in pkgDeps,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
