use serde::{Serialize};
use serde_json::{json, Map, Value};
use std::env;
use std::fs;
use std::io::Result;
use std::path::Path;
use std::process::Command;


fn snake_to_pascal(s: &str) -> String {
    s.split('_')
        .map(|w| w[..1].to_uppercase() + &w[1..])
        .collect()
}

fn process_db() -> Result<()> {
    let output_file = "packages/db/src/schema/index.ts";
    let schema_dir = "packages/db/src/schema";
    if !Path::new(schema_dir).exists() {
        return Ok(());
    }

    let mut entries: Vec<String> = fs::read_dir(schema_dir)?
        .flatten()
        .filter_map(|e| e.file_name().into_string().ok())
        .filter(|n| n.ends_with(".ts") && n != "index.ts")
        .map(|n| n.replace(".ts", ""))
        .collect();
    entries.sort();

    let mut content = String::from("// AUTO-GENERATED\nimport type { z } from 'zod'\n");
    for name in &entries {
        content.push_str(&format!("import * as {}Table from './{}'\n", name, name));
    }
    content.push_str("\nexport const schema = {\n");
    for name in &entries {
        content.push_str(&format!("  ...{}Table,\n", name));
    }
    content.push_str("}\n\n");

    for name in &entries {
        let pascal = snake_to_pascal(name);
        content.push_str(&format!("export type {{ {} }} from './{}'\n", pascal, name));
        content.push_str(&format!(
            "export {{ {}s, insert{}Schema, select{}Schema }} from './{}'\n",
            name, pascal, pascal, name
        ));
        content.push_str(&format!(
            "export type New{} = z.infer<typeof {}Table.insert{}Schema>\n\n",
            pascal, name, pascal
        ));
    }

    fs::write(output_file, content)?;
    Ok(())
}

fn process_api() -> Result<()> {
    let output_file = "packages/api/src/root.ts";
    let router_dir = "packages/api/src/router";
    if !Path::new(router_dir).exists() {
        return Ok(());
    }

    let mut entries: Vec<String> = fs::read_dir(router_dir)?
        .flatten()
        .filter_map(|e| e.file_name().into_string().ok())
        .filter(|n| n.ends_with(".ts"))
        .map(|n| n.replace(".ts", ""))
        .collect();
    entries.sort();

    let mut content = String::from("// AUTO-GENERATED\nimport { createTRPCRouter } from './trpc'\n");
    for name in &entries {
        content.push_str(&format!(
            "import {{ {}Router }} from './router/{}'\n",
            name, name
        ));
    }
    content.push_str("\nexport const appRouter = createTRPCRouter({\n");
    for name in &entries {
        content.push_str(&format!("  {}: {}Router,\n", name, name));
    }
    content.push_str("})\n\nexport type AppRouter = typeof appRouter\n");

    fs::write(output_file, content)?;
    Ok(())
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    let mode = if args.len() > 1 && args[1] == "build" {
        "build"
    } else {
        "dev"
    };

    process_db()?;
    process_api()?;

    println!("\x1b[32m✨ Codegen & Auto-format completed! (Mode: {})\x1b[0m", mode);
    Ok(())
}
