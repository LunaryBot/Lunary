import type Eris from 'eris'

declare global {
    namespace Eris {
        interface Message {
        	reply(): any
        }
    }
}