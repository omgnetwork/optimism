// Copyright 2015 The go-ethereum Authors
// This file is part of the go-ethereum library.
//
// The go-ethereum library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The go-ethereum library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the go-ethereum library. If not, see <http://www.gnu.org/licenses/>.

package rpc

import "fmt"

const defaultErrorCode = -32000

type methodNotFoundError struct{ method string }

func (e *methodNotFoundError) ErrorCode() int { return -32601 }

func (e *methodNotFoundError) Error() string {
	return fmt.Sprintf("the method %s does not exist/is not available", e.method)
}

type subscriptionNotFoundError struct{ namespace, subscription string }

func (e *subscriptionNotFoundError) ErrorCode() int { return -32601 }

func (e *subscriptionNotFoundError) Error() string {
	return fmt.Sprintf("no %q subscription in %s namespace", e.subscription, e.namespace)
}

// Invalid JSON was received by the server.
type parseError struct{ message string }

func (e *parseError) ErrorCode() int { return -32700 }

func (e *parseError) Error() string { return e.message }

// received message isn't a valid request
type invalidRequestError struct{ message string }

func (e *invalidRequestError) ErrorCode() int { return -32600 }

func (e *invalidRequestError) Error() string { return e.message }

// received message is invalid
type invalidMessageError struct{ message string }

func (e *invalidMessageError) ErrorCode() int { return -32700 }

func (e *invalidMessageError) Error() string { return e.message }

// unable to decode supplied params, or an invalid number of parameters
type invalidParamsError struct{ message string }

func (e *invalidParamsError) ErrorCode() int { return -32602 }

func (e *invalidParamsError) Error() string { return e.message }


// Custom codes for OMGX_TURING off-chain interface. Numeric codes are
// arbitrary and can be changed if they conflict with anything.

// This code is used when the contract triggers an off-chain request
type turingNeedDataError struct{ requestCode string }

func (e *turingNeedDataError) ErrorCode() int { return -23401 }

// FIXME could pretty-print this one and provide a separate method to get the raw code
//func (e *turingNeedDataError) Error() string { return "Turing off-chain request:" + e.requestCode }
func (e *turingNeedDataError) Error() string { return e.requestCode }

// This code is used when the off-chain response is not acceptable
type turingBadDataError struct{ message string }

func (e *turingBadDataError) ErrorCode() int { return -23402 }

func (e *turingBadDataError) Error() string { return e.message }

// This code is used when L2geth did not get an off-chain response
// or any other generic failure in the mechanism
type turingServerError struct{ message string }

func (e *turingServerError) ErrorCode() int { return -23403 }

func (e *turingServerError) Error() string { return e.message }
