//Imports
import {fromFileUrl, toFileUrl, common, join} from "https://deno.land/std@0.123.0/path/mod.ts"

//Project root url
const {protocol, pathname} = new URL(import.meta.url)
const url = new URL(`${protocol}//${join(pathname, "../../..")}`)

//Project root file path
const path = fromFileUrl(url)

/** Relative to project root */
function relative(path:string|URL, {ext = false} = {}) {
    //Normalize input to URL
    let url:URL
    if (path instanceof URL) {
        url = path
    }
    else {
        try {
            url = new URL(path)
        }
        catch {
            url = toFileUrl(path)
        }
    }
    const relpath = url.pathname.replace(common([root.url.pathname, url.pathname], "/"), "")
    
    //Trim filename if enabled
    if ((!ext) && (relpath.endsWith(".ts")))
        return relpath.replace(/\.ts$/, "")

    return relpath
}

/** Project root directory */
export const root = {url, path, relative}
